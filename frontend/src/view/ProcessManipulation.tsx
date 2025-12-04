import React, { useEffect, useMemo, useState } from 'react';
import { Box, TextField } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AutomatonOptionType, OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { OpenedSystems } from '../viewmodel/OpenedSystems.ts';
import { Location } from '../model/ta/location.ts';
import { useTranslation } from 'react-i18next';
import { SimulationModel } from '../viewmodel/SimulationModel.ts';
import { ProcessSelection } from './ProcessSelection.tsx';

export interface ProcessManipulationProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
  openedSystems: OpenedSystems;
  simulationModel: SimulationModel;
}

const ProcessManipulation: React.FC<ProcessManipulationProps> = (props) => {
  const { viewModel, openedProcesses, openedSystems, simulationModel } = props;
  const { t } = useTranslation();

  const [newProcessName, setNewProcessName] = useState('');
  const [nameIsEmpty, setNameIsEmpty] = useState(false);
  const [nameIsDuplicate, setNameIsDuplicate] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState('');

  const addProcess = () => {
    const isExisting = openedProcesses.automatonOptions.some((option) => newProcessName === option.label);
    if (!isExisting && newProcessName.length > 0) {
      const startLoc: Location = {
        name: 'start',
        isInitial: true,
        xCoordinate: -100,
        yCoordinate: 100,
        setLayout: true,
      };

      const newTA: AutomatonOptionType = { label: newProcessName.trim(), automaton: { locations: [startLoc], clocks: [], switches: [] } };

      openedProcesses.exchangeSelectedAutomaton({...openedProcesses.selectedOption, automaton: viewModel.ta});
      openedProcesses.addAutomatonOption(newTA);
      openedProcesses.setSelectedAutomaton(newTA);
      
      openedSystems.exchangeSelectedOption({...openedSystems.selectedSystem, 
        processes: openedSystems.selectedSystem.processes.concat(newTA)});

      setNewProcessName('');
    }
  };

  const deleteProcess = () => {
    if (openedProcesses.automatonOptions.length > 1) {
      openedProcesses.deleteAutomatonOption(openedProcesses.selectedOption);
      openedSystems.exchangeSelectedOption({...openedSystems.selectedSystem, 
        processes: openedSystems.selectedSystem.processes.filter((option) => option !== openedProcesses.selectedOption)});
    }
  };

  useEffect(() => {
    viewModel.setAutomaton(openedProcesses.selectedOption.automaton);
  }, [openedProcesses.selectedOption]);

  useEffect(() => {
    setNameIsEmpty(newProcessName.trim() === '');
    setNameIsDuplicate(openedProcesses.automatonOptions.some((option) => 
      option.label.toLowerCase() === newProcessName.trim().toLowerCase()));

    nameIsEmpty && setNameErrorMsg(t('processSelection.error.emptyName'));
    nameIsDuplicate && setNameErrorMsg(t('processSelection.error.duplicateName'));
  }, [nameIsDuplicate, nameIsEmpty, newProcessName, openedProcesses.automatonOptions, t]);

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
        <Button variant="contained" disabled={openedProcesses.automatonOptions.length === 1} onClick={deleteProcess}>
          <DeleteIcon />
          {t('processSelection.button.delete')}
        </Button>
      </Box>
    </Box>
  );
};

export default ProcessManipulation;
