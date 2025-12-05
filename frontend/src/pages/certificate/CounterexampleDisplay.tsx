import '../App.css';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Button } from '@mui/material';
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

  const [currentNode, setCurrentNode] = useState<NodeModel | undefined>(undefined);
  // const [currentEdge, setCurrentEdge] = useState<EdgeModel | undefined>(undefined);
  const initialNode = certificate.graph.nodes.filter(node => node.attributes.get("initial"))[0];

  const [disableNextStateButton, setDisableNextStateButton] = useState<boolean>(false);

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

      setCurrentNode(initialNode);
      if(certificate.getOutgoingEdges(initialNode).length == 0)
        setDisableNextStateButton(true);
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

    setCurrentNode(initialNode);
    if(certificate.getOutgoingEdges(initialNode).length == 0)
      setDisableNextStateButton(true);
    else
      setDisableNextStateButton(false);

    return;
  }

  function handleNextState() {
    const nextNode = certificate.getOutgoingEdges(currentNode)[0].targets.at(1) as NodeModel;
    setCurrentNode(nextNode);
    if(certificate.getOutgoingEdges(nextNode).length == 0)
      setDisableNextStateButton(true);
  }

  if(!currentNode)
    return (<h3 style={{ textAlign: 'center' }}>Loading</h3>)

  const buttonSx = { display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}

  return (
    <>
      <Box sx={{ display: 'flex',  height: `${7/8 * contentHeight}px`, overflow: 'hidden' }}>
        <TAStateDisplay viewModel={firstViewModel} openedProcesses={firstOpenedProcesses} system={firstSystem} 
         attributeNames={firstAttributes} contentHeight={contentHeight} currentNode={currentNode}/>
        <TAStateDisplay viewModel={secondViewModel} openedProcesses={secondOpenedProcesses} system={secondSystem} 
         attributeNames={secondAttributes} contentHeight={contentHeight} currentNode={currentNode}/>
      </Box>

      <Box sx={{ display: 'flex', height: `${1/8 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={buttonSx}>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={buttonSx}>
          <Button
              disabled={true}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.initialState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={buttonSx}>
          <Button
              disabled={true}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.previousState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={buttonSx}>
          <Button
              disabled={disableNextStateButton}
              onMouseDown={() => handleNextState()}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleNextState())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.nextState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={buttonSx}>
          <Button
              disabled={false}
              onMouseDown={() => swapTA()}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => swapTA())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.swapTA')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={buttonSx}>
        </Grid>
      </Box>
    </>
  );
}

export default CounterexampleDisplay;
