import { Clock } from '../../src/model/ta/clock';

export class ClockFixture {
  static withClockName(clockName: string): Clock {
    return { name: clockName };
  }

  static aClock(): Clock {
    return ClockFixture.withClockName('clock');
  }
}
