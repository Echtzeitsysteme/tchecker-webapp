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
import { EdgeModel, NodeModel } from 'ts-graphviz';
import { SystemOptionType } from '../../viewmodel/OpenedSystems.ts';
import ChooseTransitionsDialog from './dialogs/ChooseTransitionsDialog.tsx';
import NextRoundDialog from './dialogs/NextRoundDialogWitness.tsx';
import { TCheckerUtils } from '../../utils/tcheckerUtils.ts';
import InvalidDelayDialog from './dialogs/InvalidDelayDialog.tsx';
import { getEdgeAsString } from './EdgeFormatting.ts';

function WitnessDisplay() {

  const certificate = new Certificate(localStorage.getItem("certificate"));

  const [firstSystem, setFirstSystem] = useState<SystemOptionType>(undefined);
  const [secondSystem, setSecondSystem] = useState<SystemOptionType>(undefined);

  const [firstClockVals, setFirstClockVals] = useState<Map<string, string>>(undefined);
  const [secondClockVals, setSecondClockVals] = useState<Map<string, string>>(undefined);

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
  const [selectAutomatonStage, setSelectAutomatonStage] = useState<boolean>(true);

  const [nextEdgeIdx, setNextEdgeIdx] = useState<number>(0);
  const [edgeOptions, setEdgeOptions] = useState<EdgeModel[]>(null);
  const [edgeIdxToStateMap, setEdgeIdxToStateMap] = useState<Map<number, any>>(undefined);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  
  const ChooseTransitionContext = createContext({nextEdgeIdx, setNextEdgeIdx});
  const [chooseTransitionsOpen, setChooseTransitionsOpen] = useState<boolean>(false);
  const [nextRoundOpen, setNextRoundOpen] = useState<boolean>(true);
  const [invalidDelayOpen, setInvalidDelayOpen] = useState<boolean>(false);

  function getInitialClockVals(system: SystemOptionType) {
    let result = new Map<string, string>();

    for(const process of system.processes)
      for(const clock of process.automaton.clocks)
        result = result.set(clock.name, "0");

    return result;
  }

  function stateAndEdgeAreEqual(state, edge: EdgeModel, first: boolean) {

    const edgeTarget = edge.targets[1] as NodeModel;
    const targetVloc = ("<").concat(certificate.graph.nodes.filter(node => 
        node.id === edgeTarget.id)[0].attributes.get(first? "first_vloc" : "second_vloc"
      ).join(",")).concat(">");

    const vedge = edge.attributes.get(first? "first_vedge" : "second_vedge");
    const reset = edge.attributes.get(first? "first_vedge_do" : "second_vedge_do");
    const guard = edge.attributes.get(first? "first_vedge_prov" : "second_vedge_prov");

    return (state.state.vloc === targetVloc &&
          state.transition.vedge === vedge &&
          state.transition.guard === (guard ? guard : "") && // TODO
          state.transition.reset === (reset ? reset : ""));
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

      // const initialState = certificate.nodeToStateJSON(
      //   initialNode.attributes.get("first_vloc"),
      //   initialNode.attributes.get("first_intval") as Map<string, string>,
      //   getInitialClockVals(firstSystem)
      // );

      // setSuccessorStates(getValidSuccessorStates(initialNode, firstClockVals, true));
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

  async function handlePlayerNextState(playerIsFirst: boolean) {

    let newClockVals = new Map<string, string>(playerIsFirst? firstClockVals : secondClockVals);
    
    if(nextEdgeIdx >= 0 && edgeOptions.length > 0) {
      const nextNodeTarget = certificate.getOutgoingEdges(currentNode())[nextEdgeIdx].targets[1] as NodeModel;
      const nextNode = certificate.graph.nodes.filter(node => node.id === nextNodeTarget.id)[0];

      // check if clocks are reset by transition and set according clock values to 0
      for(const [clock, _] of newClockVals) {
        if(edgeIdxToStateMap.get(nextEdgeIdx).zone.includes(clock.concat("==0")))
          newClockVals = newClockVals.set(clock, "0");
      }

      setVisitedNodes(visitedNodes.concat(nextNode));
    } else {

      for(const [clock, value] of newClockVals) {
        newClockVals = newClockVals.set(clock, (+value - (nextEdgeIdx + 1)).toString());
      }

      const newState = certificate.nodeToStateJSON(
        currentNode().attributes.get(playerIsFirst? "first_vloc" : "second_vloc"),
        currentNode().attributes.get(playerIsFirst? "first_intval" : "second_intval") as Map<string, string>,
        newClockVals
      );
      
      // check if delay violates invariant
      const successorStates = await TCheckerUtils.callSimulateOneStep(playerIsFirst? firstSystem : secondSystem, newState);
      if(successorStates[0] === "") {
        setInvalidDelayOpen(true);
        return;
      }
    }

    playerIsFirst? setFirstClockVals(newClockVals) : setSecondClockVals(newClockVals);
    setPlayerTurn(false);
    setPlayerIsFirst(playerIsFirst);
  }

  function handleOpponentNextState() {

    let newClockVals = new Map<string, string>(playerIsFirst? secondClockVals : firstClockVals);

    if(nextEdgeIdx >= 0 && edgeOptions.length > 0) {
      for(const [clock, _] of newClockVals) {
        if(edgeIdxToStateMap.get(nextEdgeIdx).zone.includes(clock.concat("==0")))
          newClockVals = newClockVals.set(clock, "0");
      }
    } else {
      for(const [clock, value] of newClockVals) 
        newClockVals = newClockVals.set(clock, (+value - (nextEdgeIdx + 1)).toString());
    }

    playerIsFirst? setSecondClockVals(newClockVals) : setFirstClockVals(newClockVals);
    setPlayerTurn(true);
    setNextRoundOpen(true);
    setSelectAutomatonStage(true);
    setEdgeOptions(null);
  }

  function handlePreviousStep() {

    // setPlayerTurn(!playerTurn);

    // if(!playerTurn) {
    //   const newVisitedNodes = visitedNodes.filter((_, idx) => idx !== visitedNodes.length - 1);
    //   setVisitedNodes(newVisitedNodes);
    // }
  }

  function handleReset() {
    setVisitedNodes([initialNode]);
    setPlayerTurn(true);
    setNextRoundOpen(true);

    setFirstClockVals(getInitialClockVals(firstSystem));
    setSecondClockVals(getInitialClockVals(secondSystem));
    setSelectAutomatonStage(true);
    setEdgeOptions(null);
  }

  async function handleSelectAutomaton(first: boolean) {

    setPlayerIsFirst(first); 
    setSelectAutomatonStage(false);

    const state = certificate.nodeToStateJSON(
      currentNode().attributes.get(first? "first_vloc" : "second_vloc"),
      currentNode().attributes.get(first? "first_intval" : "second_intval") as Map<string, string>,
      first? firstClockVals : secondClockVals
    );
    
    // find valid successor states
    const successorStatesResponse = await TCheckerUtils.callSimulateOneStep(first? firstSystem : secondSystem, state);

    const successorStates = JSON.parse(successorStatesResponse[0]).next; 

    // for each successor state, check if current clock values fulfill guard of according transition
    // tck-simulate returns all possible future successor states (after some delay) and therefore does not catch if a clock value is too low
    // we check whether the guard is fulfilled by checking if tck-simulate throws an error for zone "guard && current clock values"
    let guardFulfillingStates = [];
    for(const successorState of successorStates) {

      const guardCheckerState = JSON.parse(JSON.stringify(state));

      // adjust zone
      const guard = successorState.transition.guard;
      guardCheckerState.zone = guard === "" ? state.zone : guard.concat(" && ").concat(state.zone);

      const guardIsFulfilled = await TCheckerUtils.callSimulateOneStep(first? firstSystem : secondSystem, guardCheckerState);
      if(guardIsFulfilled[0] !== "")
        guardFulfillingStates = guardFulfillingStates.concat(successorState);
    }

    const edges = certificate.getOutgoingEdges(currentNode());

    let edgeOptions = [];
    let edgeIdxToStateMap = new Map<number, any>();

    edges.forEach((edge, idx) => {
      // do not add duplicates to options
      if(!edgeOptions.find(edgeOption => 
        getEdgeAsString(edgeOption, certificate.graph, first) === getEdgeAsString(edge, certificate.graph, first)
      )) {

        // only add edge to options if it is enabled (guard and invariant of target location are fulfilled <==> edge is element of successor states)
        const accordingSuccessorState = guardFulfillingStates.find(state => stateAndEdgeAreEqual(state, edge, first));

        if(accordingSuccessorState) {
          edgeOptions = edgeOptions.concat(edge);
          edgeIdxToStateMap = edgeIdxToStateMap.set(idx, accordingSuccessorState.state);
        }
      }
    })

    setEdgeOptions(edgeOptions);
    setNextEdgeIdx(edgeOptions.length === 0 ? -1 : 0)
    setEdgeIdxToStateMap(edgeIdxToStateMap);
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

  const automatonSelectingButtons = <Box sx={{ display: 'flex', height: `${1/10 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '50%'}}>
          <Button
            onMouseDown={() => {handleSelectAutomaton(true)}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {handleSelectAutomaton(true)})}
            variant="contained"
          >
            Select Automaton
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '50%'}}>
          <Button
            onMouseDown={() => {handleSelectAutomaton(false)}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {handleSelectAutomaton(false)})}
            variant="contained"
          >
            Select Automaton
          </Button>
        </Grid>
      </Box>
  
  return (
    <>
      <Box sx={{ display: 'flex',  height: `${9/10 * contentHeight}px`, overflow: 'hidden' }}>
        <TAStateDisplay 
          viewModel={firstViewModel} 
          openedProcesses={firstOpenedProcesses} 
          system={firstSystem}
          isFirst={true}
          contentHeight={contentHeight} 
          currentNode={!playerTurn && !playerIsFirst ? (previousNode() || initialNode) : currentNode()}
          clockvals={firstClockVals}
          cornerElement={firstCornerElement}
        />
        <TAStateDisplay 
          viewModel={secondViewModel} 
          openedProcesses={secondOpenedProcesses} 
          system={secondSystem}
          isFirst={false}
          contentHeight={contentHeight} 
          currentNode={!playerTurn && playerIsFirst ? (previousNode() || initialNode) : currentNode()}
          clockvals={secondClockVals}
          cornerElement={secondCornerElement}
        />
      </Box>
      {selectAutomatonStage ? automatonSelectingButtons :
      (<Box sx={{ display: 'flex', height: `${1/10 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          {/* <h3> {(playerTurn && playerIsFirst) || (!playerTurn && !playerIsFirst) ? 
            t('switchDialog.input.action').concat(": ").concat(getNextAction(playerTurn ? previousNode() : currentNode())) : ""}</h3> */}
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          <Button
            disabled={(!playerTurn || !playerIsFirst)}
            onMouseDown={() => setChooseTransitionsOpen(true)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => setChooseTransitionsOpen(true))}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.chooseTransitions')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '10%'}}>
          <Button
            disabled={(playerTurn && !playerIsFirst) || (!playerTurn && playerIsFirst)}
            onMouseDown={() => {playerTurn ? handlePlayerNextState(true) : handleOpponentNextState()}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {playerTurn ? handlePlayerNextState(true) : handleOpponentNextState()})}
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
            disabled={(!playerTurn || playerIsFirst)}
            onMouseDown={() => setChooseTransitionsOpen(true)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => setChooseTransitionsOpen(true))}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.chooseTransitions')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '10%'}}>
          <Button
            disabled={(playerTurn && playerIsFirst) || (!playerTurn && !playerIsFirst)}
            onMouseDown={() => {playerTurn ? handlePlayerNextState(false) : handleOpponentNextState()}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {playerTurn ? handlePlayerNextState(false) : handleOpponentNextState()})}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
      </Box>)}
      
      <ChooseTransitionContext.Provider value={{nextEdgeIdx, setNextEdgeIdx}}>
        <ChooseTransitionsDialog 
          open={chooseTransitionsOpen} 
          onClose={() => setChooseTransitionsOpen(false)} 
          edgeOptions={edgeOptions}
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

      <InvalidDelayDialog
        open={invalidDelayOpen}
        onClose={() => setInvalidDelayOpen(false)}
        delay={-(nextEdgeIdx + 1)}
      >
      </InvalidDelayDialog>
    </>
  );
}

export default WitnessDisplay;
