import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { OpenedSystems } from '../viewmodel/OpenedSystems.ts';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { useTranslation } from 'react-i18next';
import { createTCheckerFile } from '../utils/tckFileUtils.ts'
import { TCheckerUtils } from '../utils/tcheckerUtils';
import SyntaxCheckErrorDialog from './SyntaxCheckErrorDialog';

interface ActiveModel {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}

const DownloadButton: React.FC<ActiveModel> = (props) => {
  const { openedSystems } = props;
  const { t } = useTranslation();

  const [syntaxCheckErrors, setSyntaxCheckErrors] = useState<string[] | undefined>(undefined);

  const downloadModel = async () => {
    try {

      const [response, _] = await TCheckerUtils.callSyntaxCheckForSystem(openedSystems.selectedSystem);
      
      if (!response.success) {
        setSyntaxCheckErrors(response.messages)
      } else {
        const file = await createTCheckerFile(openedSystems.selectedSystem);

        const blob = new Blob([file]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = openedSystems.selectedSystem.label + '.tck';
        a.click();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <label htmlFor="downloadModel">
      <Button variant="contained" onClick={downloadModel}>
        {t('downloadButton.button')}
      </Button>
      
      <SyntaxCheckErrorDialog open={!!syntaxCheckErrors} onClose={() => setSyntaxCheckErrors(undefined)} syntaxCheckErrors={syntaxCheckErrors} checkedSystem={openedSystems.selectedSystem}>
      </SyntaxCheckErrorDialog>
    </label>
  );
};

export default DownloadButton;
