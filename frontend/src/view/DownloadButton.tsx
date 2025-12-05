import React from 'react';
import Button from '@mui/material/Button';
import { OpenedSystems } from '../viewmodel/OpenedSystems.ts';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { useTranslation } from 'react-i18next';
import { createTCheckerFile } from '../utils/tckFileUtils.ts'

interface ActiveModel {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}

const DownloadButton: React.FC<ActiveModel> = (props) => {
  const { openedSystems, viewModel, openedProcesses } = props;
  const { t } = useTranslation();

  const downloadModel = async () => {
    try {
      openedProcesses.exchangeSelectedAutomaton({...openedProcesses.selectedOption, automaton: viewModel.ta});
      const file = await createTCheckerFile({...openedSystems.selectedSystem, processes: openedProcesses.automatonOptions});

      const blob = new Blob([file]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = openedSystems.selectedSystem.label + '.tck';
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <label htmlFor="downloadModel">
      <Button variant="contained" onClick={downloadModel}>
        {t('downloadButton.button')}
      </Button>
    </label>
  );
};

export default DownloadButton;
