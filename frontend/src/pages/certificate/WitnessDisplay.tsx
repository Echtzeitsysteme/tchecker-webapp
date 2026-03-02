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
import { TCheckerUtils } from '../../utils/tcheckerUtils.ts';
import InvalidDelayDialog from './dialogs/InvalidDelayDialog.tsx';
import StartDialog from './dialogs/StartDialogWitness.tsx';
import { evaluate } from "mathjs";

function WitnessDisplay() {

  const [certificate, setCertificate] = useState<Certificate>(undefined);

  const [firstSystem, setFirstSystem] = useState<SystemOptionType>(undefined);
  const [secondSystem, setSecondSystem] = useState<SystemOptionType>(undefined);

  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  const firstOpenedProcesses = useOpenedProcesses();
  const secondOpenedProcesses = useOpenedProcesses();

  const [initialNode, setInitialNode] = useState<NodeModel>(undefined);
  const [currentNode, setCurrentNode] = useState<NodeModel>(undefined);

  const [firstClockVals, setFirstClockVals] = useState<Map<string, string>>(undefined);
  const [secondClockVals, setSecondClockVals] = useState<Map<string, string>>(undefined);
  const [initialClockVals, setInitialClockVals] = useState<Map<string, string>[]>(undefined);

  // one state being [node, firstClockVals, secondClockVals, playerIsFirst, nextEdgeIdx, edgeOptions]
  const [visitedStates, setVisitedStates] = useState<[NodeModel, Map<string, string>, Map<string, string>, boolean, number, {transition: any; target: any}[]][]>(undefined);

  const [playerTurn, setPlayerTurn] = useState<boolean>(true);
  // with player is first meaning the player controls the left TA in the next step
  const [playerIsFirst, setPlayerIsFirst] = useState<boolean>(true);
  const [selectAutomatonStage, setSelectAutomatonStage] = useState<boolean>(true);

  // positive values (and 0) correspond to indices in edgeOptions, negative values v correspond to delay (-(v + 1))
  const [nextEdgeIdx, setNextEdgeIdx] = useState<number>(0);
  const [edgeOptions, setEdgeOptions] = useState<{transition: any; target: any}[]>([]);
  const [opponentEdge, setOpponentEdge] = useState<{transition: any; target: any}>(null);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  
  const ChooseTransitionContext = createContext({setNextEdgeIdx});
  const [chooseTransitionsOpen, setChooseTransitionsOpen] = useState<boolean>(false);
  const [nextRoundOpen, setNextRoundOpen] = useState<boolean>(false);
  const [startOpen, setStartOpen] = useState<boolean>(true);
  const [invalidDelayOpen, setInvalidDelayOpen] = useState<boolean>(false);

  async function getOpponentEdge(node: NodeModel, opponentClockVals: Map<string, string>) {

    const opponentCurrentState = certificate.nodeToStateJSON(
      currentNode.attributes.get(playerIsFirst ? "second_vloc" : "first_vloc"),
      currentNode.attributes.get(playerIsFirst ? "second_intval" : "first_intval") as Map<string, string>,
      opponentClockVals
    );

    const opponentSuccessorStates = (await TCheckerUtils.callConcreteOneStepSimulation(playerIsFirst ? secondSystem : firstSystem, opponentCurrentState))[0];
    
    const vedge = edgeOptions[nextEdgeIdx].transition.vedge;
    const state = certificate.nodeToStateJSON(
      node.attributes.get(playerIsFirst? "second_vloc" : "first_vloc"),
      node.attributes.get(playerIsFirst? "second_intval" : "first_intval") as Map<string, string>,
      new Map<string, string>
    );

    // return edge with same action as player edge 
    // (target state must be element of target symbolic state of the certificate edge chosen by player)
    return JSON.parse(opponentSuccessorStates).next.filter(successor => 
      successor.transition.vedge === vedge &&
      successor.target.vloc === state.vloc &&
      compareIntVals(successor.target.intval, state.intval) &&
      symbolicStateContainsState(
        node.attributes.get("zones"), 
        playerIsFirst? edgeOptions[nextEdgeIdx].target.clockval : successor.target.clockval, 
        playerIsFirst? successor.target.clockval : edgeOptions[nextEdgeIdx].target.clockval)
    )[0];
  }

  function updateClockVals(clockVals: Map<string, string>, delay: number) {

    let newClockVals = new Map<string, string>(clockVals);

    for(const [clock, value] of newClockVals) {
      newClockVals = newClockVals.set(clock, (+value + delay).toString());
    }

    return newClockVals;
  }

  function stringToValMap(vals: string, certificate: Certificate) {
    return certificate.parseAssignmentList(vals.split(''));
  }

  function compareIntVals(intval1: string, intval2: string) {

    const intval1Map = stringToValMap(intval1, certificate);
    const intval2Map = stringToValMap(intval2, certificate);

    if (intval1Map.size !== intval2Map.size)
        return false;

    for (let [key, val] of intval1Map) {
        if (intval2Map.get(key) !== val)
          return false;
    }

    return true;
  }

  function symbolicStateContainsState(symbolicState: string, state1: string, state2: string) {

    const clockVals1 = stringToValMap(state1, certificate);
    const clockVals2 = stringToValMap(state2, certificate);

    function addSuffix(clock: string, index: number) {
      if(clock.includes("[")){ // clocks of size > 1
         const idx = clock.indexOf("[");
         // add array access into index
         return clock.substring(0, idx).concat("_").concat(index.toString()).concat("_").concat(clock.substring(idx + 1, clock.length - 1));
      }
      else // clocks of size 1
        return clock.concat("_").concat(index.toString());
    }

    // replace clock names with current values
    const evalScope: { [key: string]: string } = {};
    evalScope["Urgent_Clock"] = "0";

    clockVals1.forEach((value, clock) => {
      // add _1 suffix back in
      evalScope[addSuffix(clock, 1)] = value;
    });

    clockVals2.forEach((value, clock) => {
      // add _2 suffix back in
      evalScope[addSuffix(clock, 2)] = value;
    });

    let sState = symbolicState.replace(/&&/g, " and ");
    sState = sState.replace(/,/g, " or ");
    // add array access into index
    sState = sState.replace(/\[(\d)+\]/g, "_$1");

    return evaluate(sState, evalScope);
  }

  useEffect(() => {
    const fetchData = async () => {

      const certificate = new Certificate(localStorage.getItem("certificate"));
      setCertificate(certificate);
      const initialNode = certificate.graph.nodes.filter(node => node.attributes.get("initial"))[0];
      setInitialNode(initialNode);
      setCurrentNode(initialNode);

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

      const initialClockVals1 = stringToValMap(JSON.parse((await TCheckerUtils.callConcreteOneStepSimulation(firstSystem, null))[0]).initial[0].state.clockval, certificate);
      const initialClockVals2 = stringToValMap(JSON.parse((await TCheckerUtils.callConcreteOneStepSimulation(secondSystem, null))[0]).initial[0].state.clockval, certificate);

      setFirstClockVals(initialClockVals1);
      setSecondClockVals(initialClockVals2);
      setInitialClockVals([initialClockVals1, initialClockVals2]);

      setVisitedStates([[initialNode, initialClockVals1, initialClockVals2, true, 0, []]]);
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

  async function handlePlayerNextState() {

    let playerClockVals = new Map<string, string>(playerIsFirst ? firstClockVals : secondClockVals);
    let opponentClockVals = new Map<string, string>(playerIsFirst ? secondClockVals : firstClockVals);
    
    if(nextEdgeIdx >= 0 && edgeOptions.length > 0) { // take transition

      // compute next node in certificate
      // (edge must have same action as transition taken by player and
      // symbolic state of target node must contain target state of transition taken by player)
      const certificateEdgeOptions = certificate.getOutgoingEdges(currentNode).filter(edge => 
        edge.attributes.get(playerIsFirst ? "first_vedge" : "second_vedge") === edgeOptions[nextEdgeIdx].transition.vedge);

      const nextNodes = certificateEdgeOptions.map(edge => {
          const nextNodeTarget = edge.targets[1] as NodeModel;
          const nextNode = certificate.graph.nodes.filter(node => node.id === nextNodeTarget.id)[0];
          return nextNode;
        }
      );

      const nextNodeOptions = await Promise.all(
        nextNodes.map(async node => {
          const state = certificate.nodeToStateJSON(
            node.attributes.get(playerIsFirst? "first_vloc" : "second_vloc"),
            node.attributes.get(playerIsFirst? "first_intval" : "second_intval") as Map<string, string>,
            new Map<string, string>
          );

          const opponentEdge = await getOpponentEdge(node, opponentClockVals);

          return ({node, keep: 
            (state.vloc === edgeOptions[nextEdgeIdx].target.vloc &&
            compareIntVals(state.intval, edgeOptions[nextEdgeIdx].target.intval) &&
            symbolicStateContainsState(
            node.attributes.get("zones"), 
            playerIsFirst? edgeOptions[nextEdgeIdx].target.clockval : opponentEdge.target.clockval, 
            playerIsFirst? opponentEdge.target.clockval : edgeOptions[nextEdgeIdx].target.clockval
        ))})
        })
      );

      const nextNode = nextNodeOptions.filter(item => item.keep).map(item => item.node)[0];

      // compute edge of opponent
      const opponentEdge = await getOpponentEdge(nextNode, opponentClockVals);

      playerClockVals = stringToValMap(edgeOptions[nextEdgeIdx].target.clockval, certificate);
      opponentClockVals = stringToValMap(opponentEdge.target.clockval, certificate);

      setCurrentNode(nextNode);
      setOpponentEdge(opponentEdge);
    } else { // delay

      const currentState = certificate.nodeToStateJSON(
        currentNode.attributes.get(playerIsFirst ? "first_vloc" : "second_vloc"),
        currentNode.attributes.get(playerIsFirst ? "first_intval" : "second_intval") as Map<string, string>,
        playerClockVals
      );
      
      // check if delay is allowed
      if(!(new RegExp(/^\d*(\.5(0)*)*$/)).test((-nextEdgeIdx - 1).toString())) {
        setInvalidDelayOpen(true);
        return;
      }

      const successorStates = (await TCheckerUtils.callConcreteOneStepSimulation(playerIsFirst ? firstSystem : secondSystem, currentState))[0];
      const delayIsAllowed = (JSON.parse(successorStates).max_delay === "infinite") || evaluate(JSON.parse(successorStates).max_delay) >= (-nextEdgeIdx - 1);
      if(!delayIsAllowed) {
        setInvalidDelayOpen(true);
        return;
      }

      playerClockVals = updateClockVals(playerClockVals, (-nextEdgeIdx - 1));
      opponentClockVals = updateClockVals(opponentClockVals, (-nextEdgeIdx - 1));
    }

    setFirstClockVals(playerIsFirst ? playerClockVals : opponentClockVals);
    setSecondClockVals(playerIsFirst ? opponentClockVals : playerClockVals);
    setPlayerTurn(false);
  }

  function handleOpponentNextState() {
    setPlayerTurn(true);
    setNextRoundOpen(true);
    setSelectAutomatonStage(true);

    setVisitedStates(visitedStates.concat([[currentNode, firstClockVals, secondClockVals, playerIsFirst, nextEdgeIdx, edgeOptions]]));
  }

  async function handlePreviousStep() {

    if(selectAutomatonStage) {
      setSelectAutomatonStage(false);
      setPlayerTurn(false);

      setPlayerIsFirst(visitedStates[visitedStates.length - 1][3]);
      setNextEdgeIdx(visitedStates[visitedStates.length - 1][4]);
      setEdgeOptions(visitedStates[visitedStates.length - 1][5]);

      const newVisitedStates = visitedStates.filter((_, idx) => idx !== visitedStates.length - 1);
      setVisitedStates(newVisitedStates);
    }

    if(!selectAutomatonStage && playerTurn)
      setSelectAutomatonStage(true);

    if(!playerTurn) {
      setPlayerTurn(true);

      setCurrentNode(visitedStates[visitedStates.length - 1][0]);
      if(nextEdgeIdx >= 0 && edgeOptions.length > 0)
        setOpponentEdge(await getOpponentEdge(visitedStates[visitedStates.length - 1][0], visitedStates[visitedStates.length - 1][playerIsFirst? 2 : 1]));
      setFirstClockVals(visitedStates[visitedStates.length - 1][1]);
      setSecondClockVals(visitedStates[visitedStates.length - 1][2]);
    }
  }

  function handleReset() {
    setCurrentNode(initialNode);
    setOpponentEdge(null);

    const initialFirstClockVals = initialClockVals[0];
    const initialSecondClockVals = initialClockVals[1];

    setFirstClockVals(initialFirstClockVals);
    setSecondClockVals(initialSecondClockVals);

    setVisitedStates([[initialNode, initialFirstClockVals, initialSecondClockVals, true, 0, []]]);

    setPlayerTurn(true);

    setStartOpen(true);
    setSelectAutomatonStage(true);
  }

  async function handleSelectAutomaton(first: boolean) {

    const currentState = certificate.nodeToStateJSON(
      currentNode.attributes.get(first ? "first_vloc" : "second_vloc"),
      currentNode.attributes.get(first ? "first_intval" : "second_intval") as Map<string, string>,
      first ? firstClockVals : secondClockVals
    );

    // compute edge options
    const successorStates = (await TCheckerUtils.callConcreteOneStepSimulation(first ? firstSystem : secondSystem, currentState))[0];
    const edgeOptions = JSON.parse(successorStates).next;

    setSelectAutomatonStage(false);

    setPlayerIsFirst(first);
    setNextEdgeIdx(edgeOptions.length === 0 ? -1 : 0);
    setEdgeOptions(edgeOptions);
  }

  if(!firstSystem || !secondSystem || !certificate || !firstClockVals || !secondClockVals)
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
          disabled={currentNode.id === initialNode.id && playerTurn && selectAutomatonStage &&
            Array.from(firstClockVals.values()).every(val => val === "0") && 
            Array.from(secondClockVals.values()).every(val => val === "0")}
          onMouseDown={() => handlePreviousStep()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handlePreviousStep())}
          aria-label={t('tcheckerCounterexampleDisplay.button.previousStep')}
          size="small"
        >
          <UndoIcon/>
        </IconButton>
        &nbsp;
        <Button
          disabled={currentNode.id === initialNode.id && playerTurn && selectAutomatonStage && 
            Array.from(firstClockVals.values()).every(val => val === "0") && 
            Array.from(secondClockVals.values()).every(val => val === "0")}
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
          currentNode={!playerTurn && !playerIsFirst ? (visitedStates[visitedStates.length - 1][0] || initialNode) : currentNode}
          clockvals={!playerTurn && !playerIsFirst ? (visitedStates[visitedStates.length - 1][1] || initialClockVals[0]) : firstClockVals}
          cornerElement={firstCornerElement}
        />
        <TAStateDisplay 
          viewModel={secondViewModel} 
          openedProcesses={secondOpenedProcesses} 
          system={secondSystem}
          isFirst={false}
          contentHeight={contentHeight} 
          currentNode={!playerTurn && playerIsFirst ? (visitedStates[visitedStates.length - 1][0] || initialNode) : currentNode}
          clockvals={!playerTurn && playerIsFirst ? (visitedStates[visitedStates.length - 1][2] || initialClockVals[1]) : secondClockVals}
          cornerElement={secondCornerElement}
        />
      </Box>
      {selectAutomatonStage ? automatonSelectingButtons :
      (<Box sx={{ display: 'flex', height: `${1/10 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          {<h3> {((playerTurn && playerIsFirst) || (!playerTurn && !playerIsFirst)) && edgeOptions ? 
            t('switchDialog.input.action').concat(": ").concat(nextEdgeIdx < 0 ? ("Delay of ").concat((-nextEdgeIdx - 1).toString()) : 
            edgeOptions[nextEdgeIdx].transition.vedge) : ""}</h3>}
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
            onMouseDown={() => {playerTurn ? handlePlayerNextState() : handleOpponentNextState()}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {playerTurn ? handlePlayerNextState() : handleOpponentNextState()})}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          {<h3> {((playerTurn && !playerIsFirst) || (!playerTurn && playerIsFirst)) && edgeOptions ? 
            t('switchDialog.input.action').concat(": ").concat(nextEdgeIdx < 0 ? ("Delay of ").concat((-nextEdgeIdx - 1).toString()) : 
            edgeOptions[nextEdgeIdx].transition.vedge) : ""}</h3>}
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
            onMouseDown={() => {playerTurn ? handlePlayerNextState() : handleOpponentNextState()}}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => {playerTurn ? handlePlayerNextState() : handleOpponentNextState()})}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
      </Box>)}
      
      <ChooseTransitionContext.Provider value={{setNextEdgeIdx}}>
        <ChooseTransitionsDialog 
          open={chooseTransitionsOpen} 
          onClose={() => setChooseTransitionsOpen(false)} 
          edgeOptions={edgeOptions}
          context={ChooseTransitionContext}
          counterExample={false}
        >
        </ChooseTransitionsDialog>
      </ChooseTransitionContext.Provider>

      <NextRoundDialog 
        open={nextRoundOpen} 
        onClose={() => setNextRoundOpen(false)} 
        opponentEdge={opponentEdge}
        opponentDelay={nextEdgeIdx < 0 ? -nextEdgeIdx - 1 : null}
        playerIsFirst={playerIsFirst}
      >
      </NextRoundDialog>

      <StartDialog 
        open={startOpen} 
        onClose={() => setStartOpen(false)}
      >
      </StartDialog>

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
