import { Clock } from '../../src/model/ta/clock';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { Switch } from '../../src/model/ta/switch';
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
