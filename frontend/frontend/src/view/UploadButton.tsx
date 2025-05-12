import React from 'react';

import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { Button } from '@mui/material';
import { AutomatonOptionType, OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { OpenedSystems, SystemOptionType } from '../viewmodel/OpenedSystems.ts';
import { Integer } from '../model/ta/integer.ts';
import { SyncConstraint } from '../model/ta/syncConstraint.ts';
import { useTranslation } from 'react-i18next';
import { TCheckerUtils } from '../utils/tcheckerUtils.ts';
import { ParseUtils } from '../utils/parseUtils.ts';
import SyntaxCheckErrorDialog from './SyntaxCheckErrorDialog.tsx';

export interface OpenedDocs {
  viewModel: AnalysisViewModel; //für update Locations iwie?
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}


const UploadButton: React.FC<OpenedDocs> = (props) => {
  const { viewModel, openedSystems, openedProcesses } = props;
  const { t } = useTranslation();

  const [syntaxCheckError, setSyntaxCheckError] = React.useState<string[] | undefined>(undefined);
  const [uploadedFileContent, setUploadedFileContent] = React.useState<string | undefined>(undefined);

  const handleClick = (uploadedFileEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputElem = uploadedFileEvent.target as HTMLInputElement & {
      files: FileList;
    };

    if (!inputElem.files[0] || !inputElem.files[0].name.endsWith('.tck')) {
      console.log('Invalid or no File');
      return;
    }
    console.log('inputFile:', inputElem.files[0]); //eingelesene File

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const fileContent = fileReader.result as string;
      setUploadedFileContent(fileContent);
      console.log('fileContent:', fileContent);

      try {

        const syntaxCheckResult = await TCheckerUtils.callSyntaxCheck(fileContent);
        console.log('syntaxCheckResult:', syntaxCheckResult);
                
        if (syntaxCheckResult.length > 0) {
          setSyntaxCheckError(syntaxCheckResult);
          return;
        }

        const parsedData = await ParseUtils.parseFile(fileContent);
        console.log('parsed Data:', parsedData);
        const systemOption = await ParseUtils.convertToTa(parsedData);
        let systemName = systemOption.label;

        const one = 1;
        openedSystems.systemOptions.forEach((option) => {
          if (option.label === systemName) {
            systemName += '__' + String(one);
          }
        });
        const processes: AutomatonOptionType[] = systemOption.processes;
        const integers: Integer[] = systemOption.integers;
        const synchronizations: SyncConstraint[] = systemOption.synchronizations;
        const newSystem: SystemOptionType = {
          label: systemName,
          processes: processes,
          integers: integers,
          synchronizations: synchronizations,
        };

        openedProcesses.selectedOption.automaton = viewModel.ta;
        openedSystems.selectedSystem.processes = openedProcesses.automatonOptions;
        openedSystems.addSystemOption(openedSystems, newSystem);

        openedSystems.selectedSystem = newSystem;
        openedProcesses.setAutomatonOptions(openedProcesses, newSystem.processes);
        viewModel.setAutomaton(viewModel, openedProcesses.selectedOption.automaton);

        console.log('openedSystems:', openedSystems);
      } catch (error) {
        console.error(error);
      }
    };
    fileReader.readAsText(inputElem.files[0]);

    inputElem.value = '';
  };

  return (
    <>
      <label htmlFor="uploadFile">
        <Button variant="contained" component="label">
          {t('uploadButton.button')}
          <input id="uploadFile" type="file" accept=".tck" onChange={handleClick} />
        </Button>
      </label>
      <SyntaxCheckErrorDialog open={!!syntaxCheckError} onClose={() => setSyntaxCheckError(undefined)} syntaxCheckErrors={syntaxCheckError} checkedSystem={uploadedFileContent!} />
    </>
  );
};

export default UploadButton;
