import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from '../view/AutomatonVisualization.tsx';
import { Box, Grid, Button } from '@mui/material';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ParseUtils } from '../utils/parseUtils.ts';
import { useButtonUtils } from '../utils/buttonUtils';
import { useAnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import LayoutButton from '../view/LayoutButton.tsx';
import ProcessSelection from '../view/ProcessSelection.tsx';
import { useOpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { useCertificateParser } from '../parser/CertificateParser.tsx';
import { /* EdgeModel, */ NodeAttributeKey, NodeModel } from 'ts-graphviz';

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

  const certificate = useCertificateParser(localStorage.getItem("certificate"));
  // const relationshipFulfilled = localStorage.getItem("relationshipFulfilled");

  const [firstSystem, setFirstSystem] = useState<string | undefined>(undefined);
  const [secondSystem, setSecondSystem] = useState<string | undefined>(undefined);

  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  const firstOpenedProcesses = useOpenedProcesses();
  const secondOpenedProcesses = useOpenedProcesses();

  const [firstAttributes, setFirstAttributes] = useState<Map<string, NodeAttributeKey>>(firstAttributesMap);
  const [secondAttributes, setSecondAttributes] = useState<Map<string, NodeAttributeKey>>(secondAttributesMap);

  const [currentNode, setCurrentNode] = useState<NodeModel | undefined>(undefined);
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
      setFirstSystem(firstSystem.label);

      const parsedDataSecond= await ParseUtils.parseFile(localStorage.getItem("secondSystem"));
      const secondSystem = await ParseUtils.convertToTa(parsedDataSecond);
      setSecondSystem(secondSystem.label);

      firstViewModel.setAutomaton(firstViewModel, firstSystem.processes[0].automaton);
      secondViewModel.setAutomaton(secondViewModel, secondSystem.processes[0].automaton);

      firstOpenedProcesses.setAutomatonOptions(firstOpenedProcesses, firstSystem.processes);
      firstOpenedProcesses.setSelectedAutomaton(firstSystem.processes[0]);
      secondOpenedProcesses.setAutomatonOptions(secondOpenedProcesses, secondSystem.processes);
      secondOpenedProcesses.setSelectedAutomaton(secondSystem.processes[0]);

      setCurrentNode(certificate.graph.nodes.filter(node => node.attributes.get("initial"))[0]); // !
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

    let tmp: any = firstAttributes;
    setFirstAttributes(secondAttributes);
    setSecondAttributes(tmp);

    tmp = firstSystem;
    setFirstSystem(secondSystem);
    setSecondSystem(tmp);

    tmp = firstViewModel.ta;
    firstViewModel.setAutomaton(firstViewModel, secondViewModel.ta);
    secondViewModel.setAutomaton(secondViewModel, tmp);

    tmp = firstOpenedProcesses.automatonOptions;
    firstOpenedProcesses.setAutomatonOptions(firstOpenedProcesses, secondOpenedProcesses.automatonOptions);
    secondOpenedProcesses.setAutomatonOptions(secondOpenedProcesses, tmp);
    tmp = firstOpenedProcesses.selectedOption;
    firstOpenedProcesses.setSelectedAutomaton(secondOpenedProcesses.selectedOption);
    secondOpenedProcesses.setSelectedAutomaton(tmp);

  }

  if(!currentNode)
    return (<h3 style={{ textAlign: 'center' }}>Loading</h3>)

  return (
    <>
      <Box sx={{ display: 'flex',  height: `${7/8 * contentHeight}px`, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: `${7/8 * contentHeight}px`, width: '50%', overflow: 'hidden' }}>
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "center", overflow: 'auto', height: `${1/8 * contentHeight}px`, width: '100%', border: "1px solid grey" }}>
            <h3 style={{ textAlign: 'center' }}>
              {firstSystem}
            </h3>
            &nbsp;
            <ProcessSelection viewModel={firstViewModel} openedProcesses={firstOpenedProcesses}/>
            &nbsp;
            <LayoutButton viewModel={firstViewModel} />
          </Grid>
          <Box sx={{ display: 'flex', height: `${6/8 * contentHeight}px`, width: '100%', overflow: 'hidden' }}>
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflow: 'hidden', height: '100%', width: '80%', border: "1px solid grey" }}>
              <AutomatonVisualization viewModel={firstViewModel} coloredLoc={currentNode.attributes.get(firstAttributes.get("vloc"))[0]} coloredSwitch='' />
            </Grid>
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'auto', height: '100%', width: '20%', border: "1px solid grey" }}>
              <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.clockPlural')} </h4>
              {firstViewModel.ta.clocks.map(clock => 
                (<h4 style={{ textAlign: 'center' }} key={clock.name}> {clock.name} = 0 </h4>)) // !
              }
            </Grid>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', height: `${7/8 * contentHeight}px`, width: '50%', overflow: 'hidden' }}>
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: "center", overflow: 'auto', height: `${1/8 * contentHeight}px`, width: '100%', border: "1px solid grey" }}>
            <h3 style={{ textAlign: 'center' }}>
              {secondSystem}
            </h3>
            &nbsp;
            <ProcessSelection viewModel={secondViewModel} openedProcesses={secondOpenedProcesses}/>
            &nbsp;
            <LayoutButton viewModel={secondViewModel} />
          </Grid>
          <Box sx={{ display: 'flex', height: `${6/8 * contentHeight}px`, width: '100%', overflow: 'hidden' }}>
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '80%', border: "1px solid grey" }}>
              <AutomatonVisualization viewModel={secondViewModel} coloredLoc={currentNode.attributes.get(secondAttributes.get("vloc"))[0]} coloredSwitch='' />
            </Grid>
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflow: 'auto', height: '100%', width: '20%', border: "1px solid grey" }}>
              <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.clockPlural')} </h4>
              {secondViewModel.ta.clocks.map(clock => 
                (<h4 style={{ textAlign: 'center' }} key={clock.name}> {clock.name} = 0 </h4>)) // !
              }
            </Grid>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: `${1/8 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={true}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.initialState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={true}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.previousState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={true}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.nextState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
              onMouseDown={() => swapTA()}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => swapTA())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.swapTA')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
        </Grid>
      </Box>
    </>
  );
}

export default CounterexampleDisplay;
