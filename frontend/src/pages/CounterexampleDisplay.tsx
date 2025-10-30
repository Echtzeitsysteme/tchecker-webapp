import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from '../view/AutomatonVisualization.tsx';
import { Box, Grid, Button } from '@mui/material';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ParseUtils } from '../utils/parseUtils.ts';
import { useAnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import LayoutButton from '../view/LayoutButton.tsx';

function CounterexampleDisplay() {
  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  // const certificate = localStorage.getItem("certificate");

  const [firstSystem, setFirstSystem] = useState<string | undefined>(undefined);
  const [secondSystem, setSecondSystem] = useState<string | undefined>(undefined);

  const { t } = useTranslation();  

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

      // automata should only have one process each since they are products
      firstViewModel.setAutomaton(firstViewModel, firstSystem.processes[0].automaton);
      secondViewModel.setAutomaton(secondViewModel, secondSystem.processes[0].automaton);
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

  return (
    <>
      <Box sx={{ display: 'flex',  height: `${7/8 * contentHeight}px`, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: `${7/8 * contentHeight}px`, width: '50%', overflow: 'hidden' }}>
          {firstSystem && firstViewModel? (
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', justifyContent: "center", overflow: 'auto', height: `${1/8 * contentHeight}px`, width: '100%', border: "1px solid grey" }}>
              <h3 style={{ textAlign: 'center' }}>
                {firstSystem}
              </h3>
              &nbsp;
              <LayoutButton viewModel={firstViewModel} />
            </Grid>) : (<Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '100%', border: "1px solid grey" }}></Grid>) }
          <Box sx={{ display: 'flex', height: `${6/8 * contentHeight}px`, width: '100%', overflow: 'hidden' }}>
            {firstViewModel ? (
                <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflow: 'hidden', height: '100%', width: '80%', border: "1px solid grey" }}>
                  <AutomatonVisualization viewModel={firstViewModel} coloredLoc={firstViewModel.ta.locations.filter(location => location.isInitial)[0].name} coloredSwitch='' />
                </Grid>) : (<Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '80%', border: "1px solid grey" }}></Grid>)
              }
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'auto', height: '100%', width: '20%', border: "1px solid grey" }}>
              <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.clockPlural')} </h4>
              {firstViewModel.ta.clocks.map(clock => 
                (<h4 style={{ textAlign: 'center' }} key={clock.name}> {clock.name} = 0 </h4>))
              }
            </Grid>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: `${7/8 * contentHeight}px`, width: '50%', overflow: 'hidden' }}>
          {secondSystem && secondViewModel? (
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', justifyContent: "center", overflow: 'auto', height: `${1/8 * contentHeight}px`, width: '100%', border: "1px solid grey" }}>
              <h3 style={{ textAlign: 'center' }}>
                {secondSystem}
              </h3>
              &nbsp;
              <LayoutButton viewModel={secondViewModel} />
            </Grid>) : (<Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '100%', border: "1px solid grey" }}></Grid>) }
          <Box sx={{ display: 'flex', height: `${6/8 * contentHeight}px`, width: '100%', overflow: 'hidden' }}>
            {secondViewModel ? (
                <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '80%', border: "1px solid grey" }}>
                  <AutomatonVisualization viewModel={secondViewModel} coloredLoc={secondViewModel.ta.locations.filter(location => location.isInitial)[0].name} coloredSwitch='' />
                </Grid>) : (<Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '80%', border: "1px solid grey" }}></Grid>)
              }
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflow: 'auto', height: '100%', width: '20%', border: "1px solid grey" }}>
              <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.clockPlural')} </h4>
              {secondViewModel.ta.clocks.map(clock => 
                (<h4 style={{ textAlign: 'center' }} key={clock.name}> {clock.name} = 0 </h4>))
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
              disabled={false}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.initalState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.previousState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
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
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.finalState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", alignItems: "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
        </Grid>
      </Box>
    </>
  );
}

export default CounterexampleDisplay;
