import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { ClauseFixture } from './clauseFixture';

export class ClockConstraintFixture {
  static withSingleClause(): ClockConstraint {
    return { clauses: [ClauseFixture.aClause()] };
  }

  static withMultipleClauses(): ClockConstraint {
    return { clauses: [ClauseFixture.withClockName('x'), ClauseFixture.withClockName('y')] };
  }

  static withEmptyClauses(): ClockConstraint {
    return { clauses: [] };
  }

  static withClockNames(...clockNames: string[]): ClockConstraint {
    return { clauses: clockNames.map((name) => ClauseFixture.withClockName(name)) };
  }
}
