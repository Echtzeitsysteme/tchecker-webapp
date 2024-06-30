import { Clock } from '../../src/model/ta/clock';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { Switch } from '../../src/model/ta/switch';
import { clockConstraintFixtureWithClockNames } from './clockConstraintFixture';
import { clockFixtureWithClockName } from './clockFixture';
import { locationFixtureWithName } from './locationFixture';

export function switchFixtureWithResetAndGuard(reset: Clock[], guard: ClockConstraint | undefined): Switch {
  return {
    source: locationFixtureWithName('source'),
    actionLabel: 'action',
    reset: reset,
    guard: guard,
    target: locationFixtureWithName('target'),
  };
}

export function switchFixtureASwitch(): Switch {
  const resets: Clock[] = [clockFixtureWithClockName('clock1'), clockFixtureWithClockName('clock2')];
  const guard = clockConstraintFixtureWithClockNames(...resets.map((c) => c.name));
  return switchFixtureWithResetAndGuard(resets, guard);
}
