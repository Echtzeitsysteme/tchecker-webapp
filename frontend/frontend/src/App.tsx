import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from './view/AutomatonVisualization';
import { Box, Grid } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import { useAnalysisViewModel } from './viewmodel/AnalysisViewModel';
import { AutomatonManipulation } from './view/AutomatonManipulation';
import ProcessSelection from './view/ProcessSelection.tsx';
import AutomatonDrawer from './view/AutomationDrawer.tsx';
import { useOpenedSystems } from './viewmodel/OpenedSystems.ts';
import { useOpenedProcesses } from './viewmodel/OpenedProcesses.ts';
import LayoutButton from './view/LayoutButton.tsx';

function App() {
  const viewModel = useAnalysisViewModel();
  const openedSystems = useOpenedSystems();
  const openedProcesses = useOpenedProcesses();
  const { t } = useTranslation();

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  useLayoutEffect(() => {
    const updateContentHeight = () => {
      const headerEl = headerRef.current;
      const toolEl = toolRef.current;
      if (toolEl) {
        const style = window.getComputedStyle(toolEl);
        const marginTop = parseInt(style.marginTop, 10);
        const marginBottom = parseInt(style.marginBottom, 10);
        const totalToolBarHeight = toolEl.offsetHeight + marginTop + marginBottom;
        setToolbarHeight(totalToolBarHeight);
      }

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
      <h1 style={{ paddingLeft: '16px' }} ref={headerRef}>
        ⏰ {t('app.title')}
      </h1>
      <Box ref={toolRef} sx={{ display: 'flex', alignItems: 'center' }}>
        <AutomatonDrawer viewModel={viewModel} openedSystems={openedSystems} openedProcesses={openedProcesses} />
        <ProcessSelection viewModel={viewModel} openedSystems={openedSystems} openedProcesses={openedProcesses} />
        <LayoutButton viewModel={viewModel} />
      </Box>
      <Box sx={{ display: 'flex', height: `${contentHeight - toolbarHeight - 1}px`, overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            lg={3}
            sx={{ borderRight: '1px solid #ccc', paddingLeft: '16px', overflowY: 'auto', height: '100%' }}
          >
            <AutomatonManipulation viewModel={viewModel} openedSystems={openedSystems} />
          </Grid>
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'hidden', height: '100%' }}>
            <AutomatonVisualization viewModel={viewModel} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default App;
