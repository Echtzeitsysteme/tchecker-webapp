import { Clock } from '../../src/model/ta/clock';
import { Location } from '../../src/model/ta/location';
import { Switch } from '../../src/model/ta/switch';
import { TimedAutomaton } from '../../src/model/ta/timedAutomaton';
import { ClauseFixture } from './clauseFixture';
import { ClockFixture } from './clockFixture';
import { LocationFixture } from './locationFixture';
import { SwitchFixture } from './switchFixture';

export class TaFixture {
  static withTwoLocationsAndTwoSwitchesAndClock(clock: Clock): TimedAutomaton {
    const nameLoc0 = 'loc0';
    const nameLoc1 = 'loc1';
    const clause = ClauseFixture.withClockName(clock.name);

    const loc0: Location = { ...LocationFixture.withName(nameLoc0), isInitial: true, invariant: { clauses: [clause] } };
    const loc1: Location = { ...LocationFixture.withName(nameLoc1) };

    const sw0: Switch = { ...SwitchFixture.withResetAndGuard([clock], undefined), source: loc0, target: loc1 };
    const sw1: Switch = { ...SwitchFixture.withResetAndGuard([], { clauses: [clause] }), source: loc1, target: loc0 };

    return {
      locations: [loc0, loc1],
      clocks: [clock],
      switches: [sw0, sw1],
    };
  }

  static withTwoLocationsAndTwoSwitches(): TimedAutomaton {
    const clock: Clock = ClockFixture.withClockName('c');
    return TaFixture.withTwoLocationsAndTwoSwitchesAndClock(clock);
  }
}
