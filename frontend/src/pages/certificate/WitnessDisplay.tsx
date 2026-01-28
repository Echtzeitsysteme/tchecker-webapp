import '../App.css';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Button, CircularProgress, IconButton } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { useEffect, useLayoutEffect, useRef, useState, createContext } from 'react';
import { ParseUtils } from '../../utils/parseUtils.ts';
import { useButtonUtils } from '../../utils/buttonUtils.ts';
import { useAnalysisViewModel } from '../../viewmodel/AnalysisViewModel.ts';
import TAStateDisplay from './TAStateDisplay.tsx';
import { useOpenedProcesses } from '../../viewmodel/OpenedProcesses.ts';
import { Certificate } from '../../parser/CertificateParser.ts';
import { NodeModel } from 'ts-graphviz';
import { SystemOptionType } from '../../viewmodel/OpenedSystems.ts';
import ChooseTransitionsDialog from './dialogs/ChooseTransitionsDialog.tsx';
import NextRoundDialog from './dialogs/NextRoundDialogWitness.tsx';
import GameOverDialog from './dialogs/GameOverDialogWitness.tsx';

function WitnessDisplay() {

  const certificate = new Certificate(localStorage.getItem("certificate"));

  const [firstSystem, setFirstSystem] = useState<SystemOptionType | undefined>(undefined);
  const [secondSystem, setSecondSystem] = useState<SystemOptionType | undefined>(undefined);

  const [firstClockVals, setFirstClockVals] = useState<Map<string, string> | undefined>(undefined);
  const [secondClockVals, setSecondClockVals] = useState<Map<string, string> | undefined>(undefined);

  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  const firstOpenedProcesses = useOpenedProcesses();
  const secondOpenedProcesses = useOpenedProcesses();

  const initialNode = certificate.graph.nodes.filter(node => node.attributes.get("initial"))[0];
  const [visitedNodes, setVisitedNodes] = useState<NodeModel[]>([initialNode]);
  const currentNode = () => visitedNodes[visitedNodes.length - 1];
  const previousNode = () => visitedNodes[visitedNodes.length - 2];

  const [playerTurn, setPlayerTurn] = useState<boolean>(true);
  // with player is first meaning the player controls the left TA in the next step
  const [playerIsFirst, setPlayerIsFirst] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [nextEdgeIdx, setNextEdgeIdx] = useState<number>(0);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  
  const ChooseTransitionContext = createContext({nextEdgeIdx, setNextEdgeIdx});
  const [chooseTransitionsOpen, setChooseTransitionsOpen] = useState<boolean>(false);
  const [nextRoundOpen, setNextRoundOpen] = useState<boolean>(true);
  const [gameOverOpen, setGameOverOpen] = useState<boolean>(false);

  function getInitialClockVals(system: SystemOptionType) {
    let result = new Map<string, string>();

    for(const process of system.processes)
      for(const clock of process.automaton.clocks)
        result = result.set(clock.name, "0");

    return result;
  }

  useEffect(() => {
    const fetchData = async () => {

      const parsedDataFirst = await ParseUtils.parseFile(localStorage.getItem("firstSystem"));
      const firstSystem = await ParseUtils.convertToTa(parsedDataFirst);
      setFirstSystem(firstSystem);

      const parsedDataSecond= await ParseUtils.parseFile(localStorage.getItem("secondSystem"));
      const secondSystem = await ParseUtils.convertToTa(parsedDataSecond);
      setSecondSystem(secondSystem);

      firstViewModel.setAutomaton(firstSystem.processes[0].automaton);
      secondViewModel.setAutomaton(secondSystem.processes[0].automaton);

      firstOpenedProcesses.setAutomatonOptions(firstSystem.processes);
      firstOpenedProcesses.setSelectedAutomaton(firstSystem.processes[0]);
      secondOpenedProcesses.setAutomatonOptions(secondSystem.processes);
      secondOpenedProcesses.setSelectedAutomaton(secondSystem.processes[0]);

      setFirstClockVals(getInitialClockVals(firstSystem));
      setSecondClockVals(getInitialClockVals(secondSystem));
    };

    fetchData();
  }, []);

  useLayoutEffect(() => {
    const updateContentHeight = () => {
      const headerEl = headerRef.current;

      if (headerEl) {
        const style = window.getComputedStyle(headerEl);
        const marginTop = parseInt(style.marginTop, 10);
        const marginBottom = parseInt(style.marginBottom, 10);
        const totalHeaderHeight = headerEl.offsetHeight + marginTop + marginBottom;
        setContentHeight(window.innerHeight - totalHeaderHeight);
      }
    };

    window.addEventListener('resize', updateContentHeight);
    updateContentHeight(); // Set initial height

    return () => window.removeEventListener('resize', updateContentHeight);
  }, []);

  function handlePlayerNextState() {

    const playerNode = currentNode();

    if(nextEdgeIdx >= 0) { // TODO: resets
      const nextNodeTarget = certificate.getOutgoingEdges(playerNode)[nextEdgeIdx].targets[1] as NodeModel;
      const nextNode = certificate.graph.nodes.filter(node => node.id === nextNodeTarget.id)[0];

      let newVisitedNodes = [...visitedNodes];
      newVisitedNodes[visitedNodes.length - 1] = nextNode;

      setVisitedNodes(newVisitedNodes);
    } else {
      let newClockVals = new Map<string, string>();
      for(const [clock, value] of playerIsFirst? firstClockVals : secondClockVals) { // TODO: invarianten checken
        newClockVals = newClockVals.set(clock, (+value - (nextEdgeIdx + 1)).toString());
      }
      playerIsFirst? setFirstClockVals(newClockVals) : setSecondClockVals(newClockVals);
    }
    
    setNextEdgeIdx(0); // just for pretty display
    setPlayerTurn(false);
  }

  function handleOpponentNextState(playerIsFirst: boolean) {

    setVisitedNodes(visitedNodes.concat(currentNode()));
    setPlayerTurn(true);
    setPlayerIsFirst(playerIsFirst);

    if(certificate.getOutgoingEdges(currentNode()).length !== 0){
      setNextRoundOpen(true);
    } else{
      setGameOverOpen(true);
      setGameOver(true);
    }
  }

  function handlePreviousStep() {

    setPlayerTurn(!playerTurn);
    setGameOver(false);

    if(!playerTurn) {
      const newVisitedNodes = visitedNodes.filter((_, idx) => idx !== visitedNodes.length - 1);
      setVisitedNodes(newVisitedNodes);
    }
  }

  function handleReset() {
    setVisitedNodes([initialNode]);
    setPlayerTurn(true);
    setNextEdgeIdx(0); // just for pretty display
    setGameOver(false);
    setNextRoundOpen(true);

    setFirstClockVals(getInitialClockVals(firstSystem));
    setSecondClockVals(getInitialClockVals(secondSystem));
  }

  if(!firstSystem || !secondSystem)
    return (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size='20px' color='inherit' />
            </div>)

  const firstCornerElement = 
    <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', alignItems: 'center', 
      justifyContent: "center", overflow: 'auto', height: `${1.25/10 * contentHeight}px`, width: '20%', border: "1px solid grey" }}>
    </Grid>;
  const secondCornerElement = 
    <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', 
      justifyContent: "center", overflow: 'auto', height: `${1.25/10 * contentHeight}px`, width: '20%', border: "1px solid grey" }}>
        <IconButton
          disabled={currentNode().id === initialNode.id && playerTurn}
          onMouseDown={() => handlePreviousStep()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handlePreviousStep())}
          aria-label={t('tcheckerCounterexampleDisplay.button.previousStep')}
          size="small"
        >
          <UndoIcon/>
        </IconButton>
        &nbsp;
        <Button
          disabled={currentNode().id === initialNode.id && playerTurn}
          onMouseDown={() => handleReset()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleReset())}
          variant="contained"
        >
          {t('tcheckerCounterexampleDisplay.button.reset')}
        </Button>
    </Grid>;
  
  return (
    <>
      <Box sx={{ display: 'flex',  height: `${9/10 * contentHeight}px`, overflow: 'hidden' }}>
        <TAStateDisplay 
          viewModel={firstViewModel} 
          openedProcesses={firstOpenedProcesses} 
          system={firstSystem}
          isFirst={true}
          contentHeight={contentHeight} 
          currentNode={playerTurn && playerIsFirst ? currentNode() : (previousNode() || initialNode)}
          clockvals={firstClockVals}
          cornerElement={firstCornerElement}
        />
        <TAStateDisplay 
          viewModel={secondViewModel} 
          openedProcesses={secondOpenedProcesses} 
          system={secondSystem}
          isFirst={false}
          contentHeight={contentHeight} 
          currentNode={playerTurn && !playerIsFirst ? currentNode() : (previousNode() || initialNode)}
          clockvals={secondClockVals}
          cornerElement={secondCornerElement}
        />
      </Box>
      <Box sx={{ display: 'flex', height: `${1/10 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          {/* <h3> {(playerTurn && playerIsFirst) || (!playerTurn && !playerIsFirst) ? 
            t('switchDialog.input.action').concat(": ").concat(getNextAction(playerTurn ? previousNode() : currentNode())) : ""}</h3> */}
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          <Button
            disabled={gameOver || !playerTurn}
            onMouseDown={() => setChooseTransitionsOpen(true)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => setChooseTransitionsOpen(true))}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.chooseTransitions')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '10%'}}>
          <Button
            disabled={gameOver || (!playerTurn && playerIsFirst)}
            onMouseDown={() => {playerTurn ? handlePlayerNextState() : handleOpponentNextState(true)}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {playerTurn ? handlePlayerNextState() : handleOpponentNextState(true)})}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          {/* <h3> {(playerTurn && !getPlayerIsFirst(previousNode())) || (!playerTurn && getPlayerIsFirst(currentNode())) ? 
            t('switchDialog.input.action').concat(": ").concat(getNextAction(playerTurn ? previousNode() : currentNode())) : ""}</h3> */}
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          <Button
            disabled={gameOver || !playerTurn}
            onMouseDown={() => setChooseTransitionsOpen(true)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => setChooseTransitionsOpen(true))}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.chooseTransitions')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '10%'}}>
          <Button
            disabled={gameOver || (!playerTurn && !playerIsFirst)}
            onMouseDown={() => {playerTurn ? handlePlayerNextState() : handleOpponentNextState(false)}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {playerTurn ? handlePlayerNextState() : handleOpponentNextState(false)})}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
      </Box>
      
      <ChooseTransitionContext.Provider value={{nextEdgeIdx, setNextEdgeIdx}}>
        <ChooseTransitionsDialog 
          open={chooseTransitionsOpen} 
          onClose={() => setChooseTransitionsOpen(false)} 
          edgeOptions={certificate.getOutgoingEdges(currentNode())}
          playerIsFirst={playerIsFirst}
          context={ChooseTransitionContext}
          graph={certificate.graph}
        >
        </ChooseTransitionsDialog>
      </ChooseTransitionContext.Provider>

      <NextRoundDialog 
        open={nextRoundOpen} 
        onClose={() => setNextRoundOpen(false)} 
        opponentEdge={certificate.getOutgoingEdges(currentNode())[nextEdgeIdx]}
        playerIsFirst={playerIsFirst}
        graph={certificate.graph}
      >
      </NextRoundDialog>

      <GameOverDialog 
        open={gameOverOpen} 
        onClose={() => setGameOverOpen(false)}
        playerIsFirst={playerIsFirst}
      >
      </GameOverDialog>

    </>
  );
}

export default WitnessDisplay;
