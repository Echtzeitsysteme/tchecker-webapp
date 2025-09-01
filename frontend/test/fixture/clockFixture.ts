import { Clock } from '../../src/model/ta/clock';

export class ClockFixture {
  static withClockName(clockName: string): Clock {
    return { name: clockName, size: 1 };
  }

  static aClock(): Clock {
    return ClockFixture.withClockName('clock');
  }
}
