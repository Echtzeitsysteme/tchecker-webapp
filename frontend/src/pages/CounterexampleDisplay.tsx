import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from '../view/AutomatonVisualization.tsx';
import { Box, Grid, Button } from '@mui/material';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ParseUtils } from '../utils/parseUtils.ts';
import { useAnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { SystemOptionType } from '../viewmodel/OpenedSystems';
import LayoutButton from '../view/LayoutButton.tsx';

function CounterexampleDisplay() {
  const firstViewModel = useAnalysisViewModel();
  const secondViewModel = useAnalysisViewModel();
  const certificate = localStorage.getItem("certificate");

  const [firstSystem, setFirstSystem] = useState<SystemOptionType | undefined>(undefined);
  const [secondSystem, setSecondSystem] = useState<SystemOptionType | undefined>(undefined);

  const { t } = useTranslation();  

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
      <Box sx={{ display: 'flex', height: `${6/7 * contentHeight}px`, overflow: 'hidden' }}>
        {firstSystem && firstViewModel ? (
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '50%', border: "1px solid grey" }}>
            <h3 style={{ textAlign: 'center' }}>
              {firstSystem.label}
            </h3>
            &nbsp;
            <LayoutButton viewModel={firstViewModel} />
            <AutomatonVisualization viewModel={firstViewModel} />
          </Grid>) : (<Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '50%', border: "1px solid grey" }}></Grid>)
        }
        {secondSystem && secondViewModel ? (
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '50%', border: "1px solid grey" }}>
            <h3 style={{ textAlign: 'center' }}>
              {secondSystem.label}
            </h3>
            &nbsp;
            <LayoutButton viewModel={secondViewModel} />
            <AutomatonVisualization viewModel={secondViewModel} />
          </Grid>) : (<Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%', width: '50%', border: "1px solid grey" }}></Grid>)
        }
      </Box>
      <Box sx={{ display: 'flex', height: `${1/7 * contentHeight}px`, overflow: 'hidden', border: "1px solid grey" }}>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", "align-items": "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", "align-items": "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.initalState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", "align-items": "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.previousState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", "align-items": "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.nextState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", "align-items": "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
          <Button
              disabled={false}
              // onMouseDown={() => downloadCertificate()}
              // onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
              variant="contained"
          >
              {t('tcheckerCounterexampleDisplay.button.finalState')}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', justifyContent: "center", "align-items": "center", overflowY: 'hidden', height: '100%', width: '100%'}}>
        </Grid>
      </Box>
    </>
  );
}

export default CounterexampleDisplay;
