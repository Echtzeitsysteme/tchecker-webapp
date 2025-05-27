import { Clock } from '../../src/model/ta/clock';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { Switch } from '../../src/model/ta/switch';
import { ClockConstraintFixture } from './clockConstraintFixture';
import { ClockFixture } from './clockFixture';
import { LocationFixture } from './locationFixture';

export class SwitchFixture {
  static withResetAndGuard(reset: Clock[], guard: ClockConstraint | undefined): Switch {
    return {
      source: LocationFixture.withName('source'),
      actionLabel: 'action',
      reset: reset,
      guard: guard,
      target: LocationFixture.withName('target'),
    };
  }

  static aSwitch(): Switch {
    const resets: Clock[] = [ClockFixture.withClockName('clock1'), ClockFixture.withClockName('clock2')];
    const guard = ClockConstraintFixture.withClockNames(...resets.map((c) => c.name));
    return SwitchFixture.withResetAndGuard(resets, guard);
  }
}
