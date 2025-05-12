import Button from '@mui/material/Button';
import { t } from 'i18next';
import React, { useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Snackbar, SnackbarCloseReason } from '@mui/material';
import { OpenedSystems } from '../viewmodel/OpenedSystems';
import { TCheckerUtils } from '../utils/tcheckerUtils';
import { ParseUtils } from '../utils/parseUtils';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import SyntaxCheckErrorDialog from './SyntaxCheckErrorDialog';
import { useButtonUtils } from '../utils/buttonUtils';
import { useTranslation } from 'react-i18next';
import ReachabilityAnalysisDialog from './ReachabilityAnalysisDialog';

export interface TCheckerActionsProps {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}
export const TCheckerActions: React.FC<TCheckerActionsProps> = (props) => {
  console.log('Running TCheckerActions');
  const { viewModel, openedSystems, openedProcesses } = props;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const [syntaxCheckErrors, setSyntaxCheckErrors] = useState<string[] | undefined>(undefined);

  const [reachabilityAnalysisOpen, setReachabilityAnalysisOpen] = useState(false);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapseLabel = isCollapsed
    ? t('manipulation.table.showContent', { content: "TChecker" })
    : t('manipulation.table.hideContent', { content: "TChecker" });



  async function callSyntaxCheck(): Promise<void> {

    const response = await TCheckerUtils.callSyntaxCheckForSystem(openedSystems.selectedSystem);
    console.log(response);
    if (response.length === 0) {
      setSuccessSnackbarOpen(true);
    } else {
      setSyntaxCheckErrors(response);
    }
  }

  async function callGenerateDotFile(): Promise<void> {
    await TCheckerUtils.callGenerateDotFile(openedSystems.selectedSystem);
  }


  async function callGenerateJsonFile(): Promise<void> {
    await TCheckerUtils.callGenerateJsonFile(openedSystems.selectedSystem);
  }

  async function callCreateProductAutomaton(): Promise<void> {
    const response = await TCheckerUtils.callCreateSynchronizedProduct(openedSystems.selectedSystem);
    console.log(response);

    const parsedData = await ParseUtils.parseFile(response);
    const newSystem = await ParseUtils.convertToTa(parsedData);
    newSystem.label = newSystem.label + '__product';


    openedProcesses.selectedOption.automaton = viewModel.ta;
    openedSystems.selectedSystem.processes = openedProcesses.automatonOptions;
    openedSystems.addSystemOption(openedSystems, newSystem);

    openedSystems.selectedSystem = newSystem;
    openedProcesses.setAutomatonOptions(openedProcesses, newSystem.processes);
    viewModel.setAutomaton(viewModel, openedProcesses.selectedOption.automaton);

  }

  function handleSnackbarClose(event: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason) {
    if (reason === 'clickaway') {
      return
    }
    setSuccessSnackbarOpen(false);
  }

  return (
    <div>
      <Button
        startIcon={isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        variant="text"
        onMouseDown={toggleCollapse}
        onKeyDown={(e) => executeOnKeyboardClick(e.key, toggleCollapse)}
        data-testid="button-hide-tchecker-actions"
      >
        {collapseLabel}
      </Button>
      {!isCollapsed && (

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', margin: '0 12px' }}>
          <Button
            onMouseDown={callSyntaxCheck}
            variant="contained"
            color="primary">
            {t('tcheckerAction.checkSyntax')}
          </Button>
          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={callGenerateDotFile}
            variant="contained"
            color="primary">
            {t('tcheckerAction.saveAsDot')}
          </Button>

          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={callGenerateJsonFile}
            variant="contained"
            color="primary">
            {t('tcheckerAction.saveAsJson')}
          </Button>

          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={callCreateProductAutomaton}
            variant="contained"
            color="primary">
            {t('tcheckerAction.createProductAutomaton')}
          </Button>
          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={() => setReachabilityAnalysisOpen(true)}
            variant="contained"
            color="primary">
            {t('tcheckerAction.reachabilityAnalysis')}
          </Button>
        </div>
      )}

      <Snackbar
        open={successSnackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
        message={t('tcheckerAction.checkSyntaxSuccess')}
      />

      <SyntaxCheckErrorDialog open={!!syntaxCheckErrors} onClose={() => setSyntaxCheckErrors(undefined)} syntaxCheckErrors={syntaxCheckErrors} checkedSystem={openedSystems.selectedSystem}>
      </SyntaxCheckErrorDialog>

      <ReachabilityAnalysisDialog  open={reachabilityAnalysisOpen} onClose={() => setReachabilityAnalysisOpen(false)} openedProcesses={openedProcesses} openedSystems={openedSystems}>

      </ReachabilityAnalysisDialog>

    </div>
  );
}