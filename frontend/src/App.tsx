import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from './view/AutomatonVisualization';
import { Box } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import { useAnalysisViewModel } from './viewmodel/AnalysisViewModel';
import { AutomatonManipulation } from './view/AutomatonManipulation';

function App() {
  const viewModel = useAnalysisViewModel();
  const { t } = useTranslation('app');

  // calculate size of content elements so that content always fits the window size
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [contentHeight, setContentHeight] = useState(window.innerHeight);

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
      <h1 style={{ paddingLeft: '16px' }} ref={headerRef}>
        ⏰ {t('title')}
      </h1>
      <Box sx={{ display: 'flex', height: `${contentHeight - 1}px`, overflow: 'hidden' }}>
        <Box sx={{ width: 300, borderRight: '1px solid #ccc', paddingLeft: '16px', overflowY: 'auto', height: '100%' }}>
          <AutomatonManipulation viewModel={viewModel} />
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'hidden', height: '100%' }}>
          <AutomatonVisualization viewModel={viewModel} />
        </Box>
      </Box>
    </>
  );
}

export default App;
