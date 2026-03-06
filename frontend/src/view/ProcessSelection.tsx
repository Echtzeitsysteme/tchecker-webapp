import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { useTranslation } from 'react-i18next';

export interface ProcessSelectionProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
}

export const ProcessSelection: React.FC<ProcessSelectionProps> = (props) => {
  const { viewModel, openedProcesses } = props;
  const { t } = useTranslation();
  const options = openedProcesses.automatonOptions;
  let value = openedProcesses.selectedOption;
  let optionLabels = openedProcesses.getLabels();

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
                    openedProcesses.exchangeSelectedAutomaton({...value, automaton: viewModel.ta});;
                    openedProcesses.setSelectedAutomaton(option);
                    viewModel.setAutomaton(option.automaton);
                }
            });
        }}
        options={optionLabels}
        renderInput={(params) => <TextField {...params} label={t('processSelection.select')} />}
    />
  );
};
