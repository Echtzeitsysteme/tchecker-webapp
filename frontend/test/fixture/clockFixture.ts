import { Clock } from '../../src/model/ta/clock';

export function clockFixtureWithClockName(clockName: string): Clock {
  return { name: clockName };
}

export function clockFixtureAClock(): Clock {
  return clockFixtureWithClockName('clock');
}
