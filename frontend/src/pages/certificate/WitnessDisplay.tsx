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
import StartDialog from './dialogs/StartDialogWitness.tsx';

function WitnessDisplay() {

  const certificate = new Certificate(localStorage.getItem("certificate"));

  const [firstSystem, setFirstSystem] = useState<SystemOptionType>(undefined);
  const [secondSystem, setSecondSystem] = useState<SystemOptionType>(undefined);

  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  const firstOpenedProcesses = useOpenedProcesses();
  const secondOpenedProcesses = useOpenedProcesses();

  const initialNode = certificate.graph.nodes.filter(node => node.attributes.get("initial"))[0];
  const [currentNode, setCurrentNode] = useState<NodeModel>(initialNode);

  const [firstClockVals, setFirstClockVals] = useState<Map<string, string>>(undefined);
  const [secondClockVals, setSecondClockVals] = useState<Map<string, string>>(undefined);

  // one state being [node, firstClockVals, secondClockVals, playerIsFirst, nextEdgeIdx, edgeOptions]
  const [visitedStates, setVisitedStates] = useState<[NodeModel, Map<string, string>, Map<string, string>, boolean, number, EdgeModel[]][]>(undefined);

  const [playerTurn, setPlayerTurn] = useState<boolean>(true);
  // with player is first meaning the player controls the left TA in the next step
  const [playerIsFirst, setPlayerIsFirst] = useState<boolean>(true);
  const [selectAutomatonStage, setSelectAutomatonStage] = useState<boolean>(true);

  const [nextEdgeIdx, setNextEdgeIdx] = useState<number>(0);
  const [edgeOptions, setEdgeOptions] = useState<EdgeModel[]>([]);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  
  const ChooseTransitionContext = createContext({nextEdgeIdx, setNextEdgeIdx});
  const [chooseTransitionsOpen, setChooseTransitionsOpen] = useState<boolean>(false);
  const [nextRoundOpen, setNextRoundOpen] = useState<boolean>(false);
  const [startOpen, setStartOpen] = useState<boolean>(true);
  const [invalidDelayOpen, setInvalidDelayOpen] = useState<boolean>(false);

  function getInitialClockVals(system: SystemOptionType) {
    let result = new Map<string, string>();

    for(const process of system.processes)
      for(const clock of process.automaton.clocks)
        result = result.set(clock.name, "0");

    return result;
  }

  function resetClockVals(clockVals: Map<string, string>, resets: string) {

    let newClockVals = new Map<string, string>(clockVals);

    for(const clock of newClockVals.keys()) {
      const clockName = clock.replace(".", "\.");
      const regex = new RegExp(`^.*${clockName}\\s*=\\s*0.*$`);

      if(regex.test(resets))
        newClockVals = newClockVals.set(clock, "0");
    }

    return newClockVals;
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

      const initialFirstClockVals = getInitialClockVals(firstSystem);
      const initialSecondClockVals = getInitialClockVals(secondSystem);

      setFirstClockVals(initialFirstClockVals);
      setSecondClockVals(initialSecondClockVals);

      setVisitedStates([[initialNode, initialFirstClockVals, initialSecondClockVals, true, 0, []]]);
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

    let playerNewClockVals = new Map<string, string>(playerIsFirst ? firstClockVals : secondClockVals);
    let opponentNewClockVals = new Map<string, string>(playerIsFirst ? secondClockVals : firstClockVals);
    
    if(nextEdgeIdx >= 0 && edgeOptions.length > 0) {
      const nextNodeTarget = edgeOptions[nextEdgeIdx].targets[1] as NodeModel;
      const nextNode = certificate.graph.nodes.filter(node => node.id === nextNodeTarget.id)[0];

      // check which clocks are reset by transition and set according clock values to 0
      const playerResets = edgeOptions[nextEdgeIdx].attributes.get(playerIsFirst ? "first_vedge_do" : "second_vedge_do");
      playerNewClockVals = resetClockVals(playerNewClockVals, playerResets);

      const opponentResets = edgeOptions[nextEdgeIdx].attributes.get(playerIsFirst ? "second_vedge_do" : "first_vedge_do");
      opponentNewClockVals = resetClockVals(opponentNewClockVals, opponentResets);

      setCurrentNode(nextNode);
    } else {

      for(const [clock, value] of playerNewClockVals) {
        playerNewClockVals = playerNewClockVals.set(clock, (+value - (nextEdgeIdx + 1)).toString());
      }

      for(const [clock, value] of opponentNewClockVals) {
        opponentNewClockVals = opponentNewClockVals.set(clock, (+value - (nextEdgeIdx + 1)).toString());
      }

      const newState = certificate.nodeToStateJSON(
        currentNode.attributes.get(playerIsFirst ? "first_vloc" : "second_vloc"),
        currentNode.attributes.get(playerIsFirst ? "first_intval" : "second_intval") as Map<string, string>,
        playerNewClockVals
      );
      
      // check if delay violates invariant
      const invariantIsViolated = (await TCheckerUtils.callSimulateOneStep(playerIsFirst ? firstSystem : secondSystem, newState))[0] === "";
      if(invariantIsViolated) {
        setInvalidDelayOpen(true);
        return;
      }
    }

    setFirstClockVals(playerIsFirst ? playerNewClockVals : opponentNewClockVals);
    setSecondClockVals(playerIsFirst ? opponentNewClockVals : playerNewClockVals);
    setPlayerTurn(false);
  }

  function handleOpponentNextState() {
    setPlayerTurn(true);
    setNextRoundOpen(true);
    setSelectAutomatonStage(true);

    setVisitedStates(visitedStates.concat([[currentNode, firstClockVals, secondClockVals, playerIsFirst, nextEdgeIdx, edgeOptions]]));
  }

  function handlePreviousStep() {

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
      setFirstClockVals(visitedStates[visitedStates.length - 1][1]);
      setSecondClockVals(visitedStates[visitedStates.length - 1][2]);
    }
  }

  function handleReset() {
    setCurrentNode(initialNode);

    const initialFirstClockVals = getInitialClockVals(firstSystem);
    const initialSecondClockVals = getInitialClockVals(secondSystem);

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

    const edges = certificate.getOutgoingEdges(currentNode);

    let edgeOptions = [];

    for(const edge of edges) {
      // do not add duplicates to options
      if(edgeOptions.find(edgeOption => 
        getEdgeAsString(edgeOption, certificate.graph, first) === getEdgeAsString(edge, certificate.graph, first)
      )) 
        continue;

      // check if guard and invariant of target location are fulfilled
      const guardCheckerState = JSON.parse(JSON.stringify(currentState));
      const guard = edge.attributes.get(first ? "first_vedge_prov" : "second_vedge_prov");

      guardCheckerState.zone = !guard ? currentState.zone : guard.concat(" && ").concat(currentState.zone);

      const guardIsViolated = (await TCheckerUtils.callSimulateOneStep(first ? firstSystem : secondSystem, guardCheckerState))[0] === "";
      if(guardIsViolated)
        continue;

      const edgeTargetNode = edge.targets[1] as NodeModel;
      const edgeTarget = certificate.graph.nodes.filter(node => node.id === edgeTargetNode.id)[0];

      let newClockVals = new Map<string, string>(playerIsFirst ? firstClockVals : secondClockVals);

      // check which clocks are reset by transition and set according clock values to 0
      const resets = edge.attributes.get(playerIsFirst ? "first_vedge_do" : "second_vedge_do");
      newClockVals = resetClockVals(newClockVals, resets);

      const invariantCheckerState = certificate.nodeToStateJSON(
        edgeTarget.attributes.get(first ? "first_vloc" : "second_vloc"),
        edgeTarget.attributes.get(first ? "first_intval" : "second_intval") as Map<string, string>,
        newClockVals
      );

      const invariantIsViolated = (await TCheckerUtils.callSimulateOneStep(first ? firstSystem : secondSystem, invariantCheckerState))[0] === "";
      if(invariantIsViolated)
        continue;

      edgeOptions = edgeOptions.concat(edge);
    }

    setSelectAutomatonStage(false);

    setPlayerIsFirst(first);
    setNextEdgeIdx(edgeOptions.length === 0 ? -1 : 0);
    setEdgeOptions(edgeOptions);

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
          disabled={currentNode.id === initialNode.id && playerTurn && 
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
          disabled={currentNode.id === initialNode.id && playerTurn && selectAutomatonStage  && 
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
          clockvals={!playerTurn && !playerIsFirst ? (visitedStates[visitedStates.length - 1][1] || getInitialClockVals(firstSystem)) : firstClockVals}
          cornerElement={firstCornerElement}
        />
        <TAStateDisplay 
          viewModel={secondViewModel} 
          openedProcesses={secondOpenedProcesses} 
          system={secondSystem}
          isFirst={false}
          contentHeight={contentHeight} 
          currentNode={!playerTurn && playerIsFirst ? (visitedStates[visitedStates.length - 1][0] || initialNode) : currentNode}
          clockvals={!playerTurn && playerIsFirst ? (visitedStates[visitedStates.length - 1][2] || getInitialClockVals(firstSystem)) : secondClockVals}
          cornerElement={secondCornerElement}
        />
      </Box>
      {selectAutomatonStage ? automatonSelectingButtons :
      (<Box sx={{ display: 'flex', height: `${1/10 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '20%'}}>
          {<h3> {((playerTurn && playerIsFirst) || (!playerTurn && !playerIsFirst)) && edgeOptions ? 
            t('switchDialog.input.action').concat(": ").concat(nextEdgeIdx < 0 ? ("Delay of ").concat((-nextEdgeIdx - 1).toString()) : 
            edgeOptions[nextEdgeIdx].attributes.get("first_vedge")) : ""}</h3>}
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
            edgeOptions[nextEdgeIdx].attributes.get("second_vedge")) : ""}</h3>}
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
        opponentEdge={edgeOptions ? edgeOptions[nextEdgeIdx] : null}
        opponentDelay={nextEdgeIdx < 0 ? -nextEdgeIdx - 1 : null}
        playerIsFirst={playerIsFirst}
        graph={certificate.graph}
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
