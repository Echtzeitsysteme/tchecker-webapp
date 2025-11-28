import React, { useEffect, useMemo, useState } from 'react';
import { Box, TextField } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AutomatonOptionType, OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { OpenedSystems } from '../viewmodel/OpenedSystems.ts';
import { Location } from '../model/ta/location.ts';
import { TimedAutomaton } from '../model/ta/timedAutomaton.ts';
import { useTranslation } from 'react-i18next';
import { SimulationModel } from '../viewmodel/SimulationModel.ts';
import ProcessSelection from './ProcessSelection.tsx';

export interface ProcessManipulationProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
  openedSystems: OpenedSystems;
  simulationModel: SimulationModel;
}

const ProcessManipulation: React.FC<ProcessManipulationProps> = (props) => {
  const { viewModel, openedProcesses, openedSystems, simulationModel } = props;
  const { t } = useTranslation();
  const options = openedProcesses.automatonOptions;

  const [newProcessName, setNewProcessName] = useState('');
  const [nameIsEmpty, setNameIsEmpty] = useState(false);
  const [nameIsDuplicate, setNameIsDuplicate] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState('');

  const addProcess = () => {
    const isExisting = options.some((option) => newProcessName === option.label);
    if (!isExisting && newProcessName.length > 0) {
      const startLoc: Location = {
        name: 'start',
        isInitial: true,
        xCoordinate: -100,
        yCoordinate: 100,
        setLayout: true,
      };
      const newTA: TimedAutomaton = { locations: [startLoc], clocks: [], switches: [] };
      const newOption: AutomatonOptionType = { label: newProcessName.trim(), automaton: newTA };
      openedProcesses.selectedOption.automaton = viewModel.ta;
      openedProcesses.addAutomatonOption(openedProcesses, newOption);
      openedSystems.selectedSystem.processes = openedProcesses.automatonOptions;
      viewModel.setAutomaton(viewModel, newOption.automaton);

      setNewProcessName('');
    }
  };

  const deleteProcess = () => {
    if (options.length > 1) {
      openedProcesses.deleteAutomatonOption(openedProcesses, openedProcesses.selectedOption);
      openedSystems.selectedSystem.processes = openedProcesses.automatonOptions;
      viewModel.setAutomaton(viewModel, openedProcesses.selectedOption.automaton);
    }
  };

  useEffect(() => {
    setNameIsEmpty(newProcessName.trim() === '');
    setNameIsDuplicate(options.some((option) => option.label.toLowerCase() === newProcessName.trim().toLowerCase()));

    nameIsEmpty && setNameErrorMsg(t('processSelection.error.emptyName'));
    nameIsDuplicate && setNameErrorMsg(t('processSelection.error.duplicateName'));
  }, [nameIsDuplicate, nameIsEmpty, newProcessName, options, t]);

  const validationError: boolean = useMemo(() => nameIsEmpty || nameIsDuplicate, [nameIsDuplicate, nameIsEmpty]);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        <TextField
          sx={{ width: 200, mr: 0.5 }}
          margin="dense"
          label={t('processSelection.input')}
          type="text"
          fullWidth
          variant="outlined"
          value={newProcessName}
          onChange={(e) => setNewProcessName(e.target.value)}
          error={nameIsDuplicate}
          helperText={validationError ? nameErrorMsg : ' '}
          data-testid={'input-process-name'}
        />
        <Button variant="contained" disabled={validationError || simulationModel.simulationActive} onClick={addProcess} sx={{ mb: 2 }}>
          <AddIcon />
          {t('processSelection.button.add')}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ProcessSelection viewModel={viewModel} openedProcesses={openedProcesses}/>
        <Button variant="contained" disabled={options.length === 1} onClick={deleteProcess}>
          <DeleteIcon />
          {t('processSelection.button.delete')}
        </Button>
      </Box>
    </Box>
  );
};

export default ProcessManipulation;
