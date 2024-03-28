import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from './view/AutomatonVisualization';
import { Box, Button, TextField } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import { useAnalysisViewModel } from './viewmodel/AnalysisViewModel';

function App() {
  const viewModel = useAnalysisViewModel();
  const { t } = useTranslation();

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
        ⏰ {t('app.title')}
      </h1>
      <Box sx={{ display: 'flex', height: `${contentHeight - 1}px`, overflow: 'hidden' }}>
        <Box sx={{ width: 300, borderRight: '1px solid #ccc', paddingLeft: '16px', overflowY: 'auto', height: '100%' }}>
          <Button variant="contained">Button 1</Button>
          <TextField label="Input 1" variant="outlined" />

          <Button variant="contained">Large Button!!! 1</Button>
          <Button variant="contained">Large Button!!! 2</Button>
          <Button variant="contained">Large Button!!! 3</Button>
          <Button variant="contained">Large Button!!! 4</Button>
          <Button variant="contained">Large Button!!! 5</Button>
          <Button variant="contained">Large Button!!! 6</Button>
          <Button variant="contained">Large Button!!! 7</Button>
          <Button variant="contained">Large Button!!! 8</Button>
          <Button variant="contained">Large Button!!! 9</Button>
          <Button variant="contained">Large Button!!! 10</Button>
          <Button variant="contained">Large Button!!! 11</Button>
          <Button variant="contained">Large Button!!! 12</Button>
          <Button variant="contained">Large Button!!! 13</Button>
          <Button variant="contained">Large Button!!! 14</Button>
          <Button variant="contained">Large Button!!! 15</Button>
          <Button variant="contained">Large Button!!! 16</Button>
          <Button variant="contained">Large Button!!! 17</Button>
          <Button variant="contained">Large Button!!! 18</Button>
          <Button variant="contained">Large Button!!! 19</Button>
          <Button variant="contained">Large Button!!! 20</Button>
          <Button variant="contained">Large Button!!! 11</Button>
          <Button variant="contained">Large Button!!! 12</Button>
          <Button variant="contained">Large Button!!! 13</Button>
          <Button variant="contained">Large Button!!! 14</Button>
          <Button variant="contained">Large Button!!! 15</Button>
          <Button variant="contained">Large Button!!! 16</Button>
          <Button variant="contained">Large Button!!! 17</Button>
          <Button variant="contained">Large Button!!! 18</Button>
          <Button variant="contained">Large Button!!! 19</Button>
          <Button variant="contained">Large Button!!! 20</Button>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'hidden', height: '100%' }}>
          <AutomatonVisualization ta={viewModel.ta} />
        </Box>
      </Box>
    </>
  );
}

export default App;
