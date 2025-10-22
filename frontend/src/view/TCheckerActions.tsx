import Button from '@mui/material/Button';
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
import LivenessAnalysisDialog from './LivenessAnalysisDialog';
import ReachabilityAnalysisDialog from './ReachabilityAnalysisDialog';
import CompareAnalysisDialog from './CompareAnalysisDialog';
import TCheckerErrorDialog from './TCheckerErrorDialog';
import { SimulationModel } from '../viewmodel/SimulationModel';

export interface TCheckerActionsProps {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
  simulationModel: SimulationModel;
}
export const TCheckerActions: React.FC<TCheckerActionsProps> = (props) => {
  const { viewModel, openedSystems, openedProcesses, simulationModel } = props;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const [tcheckerError, setTcheckerError] = useState<string | undefined>(undefined);
  const [syntaxCheckErrors, setSyntaxCheckErrors] = useState<string[] | undefined>(undefined);

  const [reachabilityAnalysisOpen, setReachabilityAnalysisOpen] = useState(false);
  const [livenessAnalysisOpen, setLivenessAnalysisOpen] = useState(false);
  const [compareAnalysisOpen, setCompareAnalysisOpen] = useState(false);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapseLabel = isCollapsed
    ? t('manipulation.table.showContent', { content: "TChecker" })
    : t('manipulation.table.hideContent', { content: "TChecker" });



  async function callSyntaxCheck(): Promise<void> {

    const [response, error] = await TCheckerUtils.callSyntaxCheckForSystem(openedSystems.selectedSystem);

    if (error) {
      setTcheckerError(error.message);
      return;
    }

    if (response === undefined || response === null) {
      return;
    }

    console.log(response);
    if (response.success) {
      setSuccessSnackbarOpen(true);
    } else {
      setSyntaxCheckErrors(response.messages);
    }
  }

  async function callGenerateDotFile(): Promise<void> {
    const [_, error] = await TCheckerUtils.callGenerateDotFile(openedSystems.selectedSystem);
    if (error) {
      setTcheckerError(error.message);
    } else {
      setTcheckerError(undefined);
    }
  }


  async function callGenerateJsonFile(): Promise<void> {
    const [_, error] = await TCheckerUtils.callGenerateJsonFile(openedSystems.selectedSystem);
    if (error) {
      setTcheckerError(error.message);
    } else {
      setTcheckerError(undefined);
    }
  }

  async function callCreateProductAutomaton(): Promise<void> {
    const [response, error] = await TCheckerUtils.callCreateSynchronizedProduct(openedSystems.selectedSystem);

    if (error) {
      setTcheckerError(error.message);
      return;
    }

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

  function startSimulation(): void {
    simulationModel.startSimulation(openedSystems.selectedSystem);
    
  }

  function handleSnackbarClose(_: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason) {
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
          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={() => setLivenessAnalysisOpen(true)}
            variant="contained"
            color="primary">
            {t('tcheckerAction.livenessAnalysis')}
          </Button>
          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={() => setCompareAnalysisOpen(true)}
            variant="contained"
            color="primary">
            {t('tcheckerAction.compareAnalysis')}
          </Button>
          <Button
            style={{ marginTop: '12px' }}
            onMouseDown={() => startSimulation()}
            variant="contained"
            color="primary">
            {t('tcheckerAction.simulate')}
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

      <LivenessAnalysisDialog open={livenessAnalysisOpen} onClose={() => setLivenessAnalysisOpen(false)} openedProcesses={openedProcesses} openedSystems={openedSystems}>
      </LivenessAnalysisDialog>

      <CompareAnalysisDialog open={compareAnalysisOpen} onClose={() => setCompareAnalysisOpen(false)} openedSystems={openedSystems}>
      </CompareAnalysisDialog>

      <TCheckerErrorDialog open={!!tcheckerError} onClose={() => setTcheckerError(undefined)} errorMessage={tcheckerError || ''}>

      </TCheckerErrorDialog>

    </div>
  );
}