import { Clock } from '../../src/model/ta/clock';
import { Location } from '../../src/model/ta/location';
import { Switch } from '../../src/model/ta/switch';
import { TimedAutomaton } from '../../src/model/ta/timedAutomaton';
import { clauseFixtureWithClockName } from './clauseFixture';
import { locationFixtureWithName } from './locationFixture';
import { switchFixtureWithResetAndGuard } from './switchFixture';

export function taFixtureWithTwoLocationsAndTwoSwitches(): TimedAutomaton {
  const nameLoc0 = 'loc0';
  const nameLoc1 = 'loc1';
  const clock: Clock = { name: 'c' };
  const clause = clauseFixtureWithClockName(clock.name);

  const loc0: Location = { ...locationFixtureWithName(nameLoc0), invariant: { clauses: [clause] } };
  const loc1: Location = { ...locationFixtureWithName(nameLoc1) };

  const sw0: Switch = { ...switchFixtureWithResetAndGuard([clock], undefined), source: loc0, target: loc1 };
  const sw1: Switch = { ...switchFixtureWithResetAndGuard([], { clauses: [clause] }), source: loc1, target: loc0 };

  return {
    locations: [loc0, loc1],
    clocks: [clock],
    switches: [sw0, sw1],
  };
}
