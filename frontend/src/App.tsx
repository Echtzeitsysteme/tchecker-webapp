import './App.css';
import { useTranslation } from 'react-i18next';
import AutomatonVisualization from './view/AutomatonVisualization';
import { Action } from './model/ta/action';
import { Clock } from './model/ta/clock';
import { ClockConstraint } from './model/ta/clockConstraint';
import { ClockComparator } from './model/ta/clockComparator';
import { Location } from './model/ta/location';
import { Switch } from './model/ta/switch';
import { TimedAutomaton } from './model/ta/timedAutomaton';
import { Box, Button, TextField } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';

function App() {
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

  const action1: Action = { name: 'start' };
  const action2: Action = { name: 'stop' };

  const clock1: Clock = { name: 'x' };
  const clock2: Clock = { name: 'y' };

  const clockConstraint1: ClockConstraint = {
    lhs: clock1,
    op: ClockComparator.LESSER,
    rhs: 5,
  };

  const clockConstraint2: ClockConstraint = {
    lhs: clock2,
    op: ClockComparator.GEQ,
    rhs: 3,
  };

  const location1: Location = {
    name: 'InitialState',
    invariant: clockConstraint1,
  };

  const location2: Location = {
    name: 'FinalState',
  };

  const switch1: Switch = {
    source: location1,
    guard: clockConstraint2,
    action: action1,
    reset: [clock1],
    target: location2,
  };

  const timedAutomaton: TimedAutomaton = {
    locations: [location1, location2],
    initialLocation: location1,
    actions: [action1, action2],
    clocks: [clock1, clock2],
    switches: [switch1],
  };

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
          <AutomatonVisualization ta={timedAutomaton} />
        </Box>
      </Box>
    </>
  );
}

export default App;
