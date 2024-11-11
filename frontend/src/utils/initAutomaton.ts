import { Location } from '../model/ta/location';
import { Clock } from '../model/ta/clock';
import { ClockComparator } from '../model/ta/clockComparator';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { Switch } from '../model/ta/switch';

const CLOCK_0: Clock = { name: 'x', size: 1 };
const CLOCK_1: Clock = { name: 'y', size: 1 };

const CLOCK_CONSTRAINT_0: ClockConstraint = {
  clauses: [
    {
      lhs: CLOCK_0,
      op: ClockComparator.LESSER,
      rhs: 5,
    },
  ],
  freeClauses: [],
};
const CLOCK_CONSTRAINT_1: ClockConstraint = {
  clauses: [
    {
      lhs: CLOCK_0,
      op: ClockComparator.GREATER,
      rhs: 1,
    },
    {
      lhs: CLOCK_1,
      op: ClockComparator.GEQ,
      rhs: 3,
    },
  ],
  freeClauses: [],
};

const LOC_0: Location = {
  name: 'init',
  isInitial: true,
  invariant: CLOCK_CONSTRAINT_0,
  xCoordinate: -100,
  yCoordinate: 100,
  setLayout: true,
};
const LOC_1: Location = {
  name: 'final',
  xCoordinate: 100,
  yCoordinate: 100,
  setLayout: true,
};

const SWITCH_0: Switch = {
  source: LOC_0,
  guard: CLOCK_CONSTRAINT_1,
  actionLabel: 'start',
  reset: [CLOCK_0],
  target: LOC_1,
};

export const INIT_AUTOMATON: TimedAutomaton = {
  locations: [LOC_0, LOC_1],
  clocks: [CLOCK_0, CLOCK_1],
  switches: [SWITCH_0],
};
