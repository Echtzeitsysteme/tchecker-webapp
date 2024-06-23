import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { clauseFixtureAClause, clauseFixtureWithClockName } from './clauseFixture';

export function clockConstraintFixtureWithSingleClause(): ClockConstraint {
  return { clauses: [clauseFixtureAClause()] };
}

export function clockConstraintFixtureWithMultipleClauses(): ClockConstraint {
  return { clauses: [clauseFixtureWithClockName('x'), clauseFixtureWithClockName('y')] };
}

export function clockConstraintFixtureWithEmptyClauses(): ClockConstraint {
  return { clauses: [] };
}

export function clockConstraintFixtureWithClockNames(...clockNames: string[]): ClockConstraint {
  return { clauses: clockNames.map((name) => clauseFixtureWithClockName(name)) };
}
