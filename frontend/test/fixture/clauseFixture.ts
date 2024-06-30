import { Clause } from '../../src/model/ta/clause';
import { ClockComparator } from '../../src/model/ta/clockComparator';
import { clockFixtureWithClockName } from './clockFixture';

export function clauseFixtureAClause(): Clause {
  return clauseFixtureWithClockName('x');
}

export function clauseFixtureWithClockName(clockName: string): Clause {
  return { lhs: clockFixtureWithClockName(clockName), op: ClockComparator.LEQ, rhs: 5 };
}
