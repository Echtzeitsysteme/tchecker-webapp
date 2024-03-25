import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
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

function App() {
  const [count, setCount] = useState(0);
  const { t } = useTranslation();

  const action1: Action = { name: 'start' };
  const action2: Action = { name: 'stop' };

  const clock1: Clock = { name: 'timer1' };
  const clock2: Clock = { name: 'timer2' };

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
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>⏰ {t('app.title')}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      <AutomatonVisualization ta={timedAutomaton} />
    </>
  );
}

export default App;
