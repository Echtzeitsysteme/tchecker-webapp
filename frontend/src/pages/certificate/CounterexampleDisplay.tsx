import '../App.css';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Button, IconButton } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ParseUtils } from '../../utils/parseUtils.ts';
import { useButtonUtils } from '../../utils/buttonUtils.ts';
import { useAnalysisViewModel } from '../../viewmodel/AnalysisViewModel.ts';
import TAStateDisplay from './TAStateDisplay.tsx';
import { useOpenedProcesses } from '../../viewmodel/OpenedProcesses.ts';
import { Certificate } from '../../parser/CertificateParser.ts';
import { /* EdgeModel, */ NodeAttributeKey, NodeModel } from 'ts-graphviz';
import { SystemOptionType } from '../../viewmodel/OpenedSystems.ts';

const firstAttributesMap = new Map<string, NodeAttributeKey>([
  ['clockval', 'clockval_1' as NodeAttributeKey],
  ['intval', 'first_intval' as NodeAttributeKey],
  ['vloc', 'first_vloc' as NodeAttributeKey],
  ['vedge', 'first_vedge' as NodeAttributeKey],
  ['vedge_do', 'first_vedge_do' as NodeAttributeKey],
  ['vedge_prov', 'first_vedge_prov' as NodeAttributeKey],
]);

const secondAttributesMap = new Map<string, NodeAttributeKey>([
  ['clockval', 'clockval_2' as NodeAttributeKey],
  ['intval', 'second_intval' as NodeAttributeKey],
  ['vloc', 'second_vloc' as NodeAttributeKey],
  ['vedge', 'second_vedge' as NodeAttributeKey],
  ['vedge_do', 'second_vedge_do' as NodeAttributeKey],
  ['vedge_prov', 'second_vedge_prov' as NodeAttributeKey],
]);

function CounterexampleDisplay() {

  const certificate = new Certificate(localStorage.getItem("certificate"));
  // const relationshipFulfilled = localStorage.getItem("relationshipFulfilled");

  const [firstSystem, setFirstSystem] = useState<SystemOptionType | undefined>(undefined);
  const [secondSystem, setSecondSystem] = useState<SystemOptionType | undefined>(undefined);

  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  const firstOpenedProcesses = useOpenedProcesses();
  const secondOpenedProcesses = useOpenedProcesses();

  const [firstAttributes, setFirstAttributes] = useState<Map<string, NodeAttributeKey>>(firstAttributesMap);
  const [secondAttributes, setSecondAttributes] = useState<Map<string, NodeAttributeKey>>(secondAttributesMap);

  const initialNode = certificate.graph.nodes.filter(node => node.attributes.get("initial"))[0];
  const [firstCurrentNode, setFirstCurrentNode] = useState<NodeModel>(initialNode);
  const [secondCurrentNode, setSecondCurrentNode] = useState<NodeModel>(initialNode);

  // last item is current node of second (since second starts)
  const [visitedNodes, setVisitedNodes] = useState<NodeModel[]>([initialNode]);
  const [firstIsNext, setFirstIsNext] = useState<boolean>(false);
  // const [currentEdge, setCurrentEdge] = useState<EdgeModel | undefined>(undefined);

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);

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

  function swapTA() {

    setFirstAttributes(secondAttributes);
    setSecondAttributes(firstAttributes);

    setFirstSystem(secondSystem);
    setSecondSystem(firstSystem);

    firstViewModel.setAutomaton(secondViewModel.ta);
    secondViewModel.setAutomaton(firstViewModel.ta);

    firstOpenedProcesses.setAutomatonOptions(secondOpenedProcesses.automatonOptions);
    secondOpenedProcesses.setAutomatonOptions(firstOpenedProcesses.automatonOptions);
    firstOpenedProcesses.setSelectedAutomaton(secondOpenedProcesses.selectedOption);
    secondOpenedProcesses.setSelectedAutomaton(firstOpenedProcesses.selectedOption);

    setFirstCurrentNode(secondCurrentNode);
    setSecondCurrentNode(firstCurrentNode);
  }

  function handleNextState(first: boolean) {

    let nextNodeTarget = first ? firstCurrentNode : secondCurrentNode;
    if(!first)
      setVisitedNodes(visitedNodes.concat(nextNodeTarget));
    // skip transitions with 0 delay (synchronizations)
    while(certificate.getOutgoingEdges(nextNodeTarget)[0].attributes.get("delay") == 0)
      nextNodeTarget = certificate.getOutgoingEdges(nextNodeTarget)[0].targets.at(1) as NodeModel;

    nextNodeTarget = certificate.getOutgoingEdges(nextNodeTarget)[0].targets.at(1) as NodeModel;
    const nextNode = certificate.graph.nodes.filter(node => node.id === nextNodeTarget.id)[0];

    first ? setFirstCurrentNode(nextNode) : setSecondCurrentNode(nextNode);
    setFirstIsNext(!firstIsNext);
  }

  function handleGoToInitialState() {
    setFirstCurrentNode(initialNode);
    setSecondCurrentNode(initialNode);
    setVisitedNodes([initialNode])
  }

  function handlePreviousStep() {
    if(firstIsNext){
      setFirstIsNext(false);
      setSecondCurrentNode(visitedNodes[visitedNodes.length - 2]);
      const newVisitedNodes = visitedNodes.filter((_, idx) => idx !== visitedNodes.length - 1);
      setVisitedNodes(newVisitedNodes);
    } else {
      setFirstIsNext(true);
      setFirstCurrentNode(visitedNodes[visitedNodes.length - 2]);
    }
  }

  if(!firstSystem || !secondSystem)
    return (<h3 style={{ textAlign: 'center' }}>Loading</h3>)

  const firstCornerElement = 
    <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', alignItems: 'center', 
      justifyContent: "center", overflow: 'auto', height: `${1.25/10 * contentHeight}px`, width: '20%', border: "1px solid grey" }}>
        <IconButton
          onMouseDown={() => swapTA()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => swapTA())}
          aria-label={t('tcheckerCounterexampleDisplay.button.swapTA')}
        >
          <SyncAltIcon/>
        </IconButton>
    </Grid>;
  const secondCornerElement = 
    <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', 
      justifyContent: "center", overflow: 'auto', height: `${1.25/10 * contentHeight}px`, width: '20%', border: "1px solid grey" }}>
        <IconButton
          disabled={firstCurrentNode.id === initialNode.id && secondCurrentNode.id === initialNode.id}
          onMouseDown={() => handlePreviousStep()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handlePreviousStep())}
          aria-label={t('tcheckerCounterexampleDisplay.button.previousStep')}
          size="small"
        >
          <UndoIcon/>
        </IconButton>
        &nbsp;
        <Button
          disabled={firstCurrentNode.id === initialNode.id && secondCurrentNode.id === initialNode.id}
          onMouseDown={() => handleGoToInitialState()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleGoToInitialState())}
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
          attributeNames={firstAttributes} 
          contentHeight={contentHeight} 
          currentNode={firstCurrentNode}
          cornerElement={firstCornerElement}
        />
        <TAStateDisplay 
          viewModel={secondViewModel} 
          openedProcesses={secondOpenedProcesses} 
          system={secondSystem} 
          attributeNames={secondAttributes} 
          contentHeight={contentHeight} 
          currentNode={secondCurrentNode}
          cornerElement={secondCornerElement}
        />
      </Box>
      <Box sx={{ display: 'flex', height: `${1/10 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '40%'}}>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '10%'}}>
          <Button
            disabled={!firstIsNext || certificate.getOutgoingEdges(firstCurrentNode).length === 0}
            onMouseDown={() => handleNextState(true)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleNextState(true))}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '40%'}}>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '10%'}}>
          <Button
            disabled={firstIsNext || certificate.getOutgoingEdges(secondCurrentNode).length === 0}
            onMouseDown={() => handleNextState(false)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleNextState(false))}
            variant="contained"
          >
            {t('tcheckerCounterexampleDisplay.button.nextStep')}
          </Button>
        </Grid>
      </Box>
    </>
  );
}

export default CounterexampleDisplay;
