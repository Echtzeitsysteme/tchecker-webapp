import { Clause } from '../../src/model/ta/clause';
import { ClockComparator } from '../../src/model/ta/clockComparator';
import { ClockFixture } from './clockFixture';

export class ClauseFixture {
  static aClause(): Clause {
    return ClauseFixture.withClockName('x');
  }

  static withClockName(clockName: string): Clause {
    return { lhs: ClockFixture.withClockName(clockName), op: ClockComparator.LEQ, rhs: 5 };
  }
}
