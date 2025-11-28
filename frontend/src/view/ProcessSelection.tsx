import React, { useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { useTranslation } from 'react-i18next';

export interface ProcessSelectionProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
}

const ProcessSelection: React.FC<ProcessSelectionProps> = (props) => {
  const { viewModel, openedProcesses } = props;
  const { t } = useTranslation();
  const options = openedProcesses.automatonOptions;
  let value = openedProcesses.selectedOption;
  let optionLabels = openedProcesses.getLabels(openedProcesses.automatonOptions);

  useEffect(() => {
  }, [options, t]);

  return (
    <Autocomplete
        sx={{ width: 200, mr: 0.5 }}
        id="select-automaton"
        freeSolo
        selectOnFocus
        handleHomeEndKeys
        disableClearable
        value={value.label}
        onChange={(_, newValue) => {
            //set value and automaton to existing option
            options.forEach((option) => {
                if (option.label === newValue) {
                    value.automaton = viewModel.ta;
                    openedProcesses.selectedOption = option;
                    viewModel.setAutomaton(viewModel, option.automaton);
                }
            });
        }}
        options={optionLabels}
        renderInput={(params) => <TextField {...params} label={t('processSelection.select')} />}
    />
  );
};

export default ProcessSelection;
