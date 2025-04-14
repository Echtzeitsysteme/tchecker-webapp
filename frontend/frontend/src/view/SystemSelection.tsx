import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { OpenedSystems, SystemOptionType } from '../viewmodel/OpenedSystems.ts';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { TimedAutomaton } from '../model/ta/timedAutomaton.ts';
import { Location } from '../model/ta/location.ts';
import { useTranslation } from 'react-i18next';

export interface SystemSelectionProps {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}

const SystemSelection: React.FC<SystemSelectionProps> = (props) => {
  const { viewModel, openedSystems, openedProcesses } = props;
  const { t } = useTranslation();
  const options = openedSystems.systemOptions;
  let value = openedSystems.selectedSystem;
  let optionLabels = openedSystems.getLabels(openedSystems.systemOptions);

  const [newSystemName, setNewSystemName] = useState('');
  const [nameIsEmpty, setNameIsEmpty] = useState(false);
  const [nameIsDuplicate, setNameIsDuplicate] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState('');

  const addSystem = () => {
    const isExisting = options.some((option) => newSystemName === option.label);
    if (!isExisting && newSystemName.length > 0) {
      const startLoc: Location = {
        name: 'start',
        isInitial: true,
        xCoordinate: -100,
        yCoordinate: 100,
        setLayout: true,
      };
      const newTA: TimedAutomaton = { locations: [startLoc], clocks: [], switches: [] };
      const newOption: SystemOptionType = {
        label: newSystemName.trim(),
        processes: [{ label: 'init_Process', automaton: newTA }],
        integers: [],
        synchronizations: [],
      };
      openedProcesses.selectedOption.automaton = viewModel.ta;
      openedSystems.selectedSystem.processes = openedProcesses.automatonOptions;
      openedSystems.addSystemOption(openedSystems, newOption);
      value = newOption;
      openedProcesses.setAutomatonOptions(openedProcesses, value.processes);
      viewModel.setAutomaton(viewModel, value.processes[0].automaton);
      optionLabels = openedSystems.getLabels(openedSystems.systemOptions);
      console.log('system after addition', openedSystems);

      setNewSystemName('');
    }
  };

  const deleteSystem = () => {
    if (options.length > 1) {
      openedSystems.deleteSystemOption(openedSystems, openedSystems.selectedSystem);
      value = openedSystems.selectedSystem;
      openedProcesses.setAutomatonOptions(openedProcesses, value.processes);
      viewModel.setAutomaton(viewModel, value.processes[0].automaton);
    }
  };

  useEffect(() => {
    setNameIsEmpty(newSystemName.trim() === '');
    setNameIsDuplicate(options.some((option) => option.label.toLowerCase() === newSystemName.trim().toLowerCase()));

    nameIsEmpty && setNameErrorMsg(t('systemSelection.error.emptyName'));
    nameIsDuplicate && setNameErrorMsg(t('systemSelection.error.duplicateName'));
  }, [nameIsDuplicate, nameIsEmpty, newSystemName, options, t]);

  const validationError: boolean = useMemo(() => nameIsEmpty || nameIsDuplicate, [nameIsDuplicate, nameIsEmpty]);

  return (
    <Box>
      <Box sx={{ alignItems: 'center', mb: 3 }}>
        <TextField
          sx={{ width: 200, mr: 0.2 }}
          margin="dense"
          label={t('systemSelection.input')}
          type="text"
          fullWidth
          variant="outlined"
          value={newSystemName}
          onChange={(e) => setNewSystemName(e.target.value)}
          error={nameIsDuplicate}
          helperText={validationError ? nameErrorMsg : ''}
          data-testid={'input-system-name'}
        />
        <br />
        <Button variant="contained" disabled={validationError} onClick={addSystem} sx={{ mb: 1 }}>
          <AddIcon />
          {t('systemSelection.button.add')}
        </Button>
      </Box>
      <Box sx={{ alignItems: 'center', mb: 1, mt: 2 }}>
        <Autocomplete
          sx={{ width: 200, mr: 0.2 }}
          id="select-automaton"
          freeSolo
          selectOnFocus
          handleHomeEndKeys
          disableClearable
          value={value}
          onChange={(event, newValue) => {
            console.log(event);
            console.log('Optionen:', options);

            //set value and automaton to existing option
            options.forEach((option) => {
              if (option.label === newValue) {
                openedProcesses.selectedOption.automaton = viewModel.ta;
                console.log('processOptions:', openedProcesses.automatonOptions);
                value.processes = openedProcesses.automatonOptions;
                openedSystems.selectedSystem = option;
                //setValue(option);
                openedSystems.setSelectedSystem(option);
                openedProcesses.setAutomatonOptions(openedProcesses, openedSystems.selectedSystem.processes);
                viewModel.setAutomaton(viewModel, option.processes[0].automaton);
                //console.log("openedSystems after change:",openedSystems);
                //console.log("openedProcesses after change:", openedProcesses);
              }
            });
          }}
          options={optionLabels}
          renderInput={(params) => <TextField {...params} label={t('systemSelection.select')} />}
        />
        <Button variant="contained" disabled={options.length === 1} onClick={deleteSystem} sx={{ mt: 0.5 }}>
          <DeleteIcon />
          {t('systemSelection.button.delete')}
        </Button>
      </Box>
    </Box>
  );
};

export default SystemSelection;
