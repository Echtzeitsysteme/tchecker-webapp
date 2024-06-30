import { renderHook } from '@testing-library/react';
import { useClockConstraintUtils } from '../../src/utils/clockConstraintUtils';
import { Clause } from '../../src/model/ta/clause';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { ClauseViewData } from '../../src/viewmodel/ClausesViewModel';
import { TimedAutomaton } from '../../src/model/ta/timedAutomaton';
import { Clock } from '../../src/model/ta/clock';
import { clockFixtureAClock, clockFixtureWithClockName } from '../fixture/clockFixture';
import {
  taFixtureWithTwoLocationsAndTwoSwitches,
  taFixtureWithTwoLocationsAndTwoSwitchesAndClock,
} from '../fixture/timedAutomatonFixture';
import { clauseFixtureAClause, clauseFixtureWithClockName } from '../fixture/clauseFixture';
import {
  clockConstraintFixtureWithClockNames,
  clockConstraintFixtureWithSingleClause,
} from '../fixture/clockConstraintFixture';
import {
  clauseViewDataFixtureSomeValidViewData,
  clauseViewDataFixtureValidViewDataWithClockName,
} from '../fixture/clauseViewDataFixture';

describe('clockConstraintUtils', () => {
  // define and import all util functions once before starting as import is more complicated due to the use of hooks
  let clausesEqual: (clause1?: Clause, clause2?: Clause) => boolean;
  let clockConstraintsEqual: (cc1?: ClockConstraint, cc2?: ClockConstraint) => boolean;
  let transformToClockConstraint: (clauseData: ClauseViewData[]) => ClockConstraint | undefined;
  let constraintUsesClock: (clockName: string, clockConstraint?: ClockConstraint) => boolean;
  let taUsesClockInAnyConstraint: (ta?: TimedAutomaton, clock?: Clock) => boolean;
  let removeAllClausesUsingClock: (clock: Clock, ta: TimedAutomaton) => void;

  beforeAll(() => {
    const { result } = renderHook(() => useClockConstraintUtils());
    clausesEqual = result.current.clausesEqual;
    clockConstraintsEqual = result.current.clockConstraintsEqual;
    transformToClockConstraint = result.current.transformToClockConstraint;
    constraintUsesClock = result.current.constraintUsesClock;
    taUsesClockInAnyConstraint = result.current.taUsesClockInAnyConstraint;
    removeAllClausesUsingClock = result.current.removeAllClausesUsingClock;
  });

  test('clausesEqual returns true when both clauses are equal', () => {
    // given
    const fixtureFunction = clauseFixtureAClause;
    const clause1 = fixtureFunction();
    const clause2 = fixtureFunction();

    // when
    const areEqual = clausesEqual(clause1, clause2);

    // then
    expect(areEqual).toBe(true);
  });

  test('clausesEqual returns false when both clauses are defined but not equal', () => {
    // given
    const clause1 = clauseFixtureWithClockName('x');
    const clause2 = clauseFixtureWithClockName('y');

    // when
    const areEqual = clausesEqual(clause1, clause2);

    // then
    expect(areEqual).toBe(false);
  });

  test('clausesEqual returns false when exactly one clause is defined', () => {
    // given
    const clauseDefined = clauseFixtureAClause();

    // when
    const areEqual = clausesEqual(clauseDefined, undefined);

    // then
    expect(areEqual).toBe(false);
  });

  test('clausesEqual returns true when both clauses are undefined', () => {
    // when
    const areEqual = clausesEqual(undefined, undefined);

    // then
    expect(areEqual).toBe(true);
  });

  test('clockConstraintsEqual returns true when both constraints are equal', () => {
    // given
    const fixtureFunction = clockConstraintFixtureWithSingleClause;
    const constraint1 = fixtureFunction();
    const constraint2 = fixtureFunction();

    // when
    const areEqual = clockConstraintsEqual(constraint1, constraint2);

    // then
    expect(areEqual).toBe(true);
  });

  test('clockConstraintsEqual returns false when both constraints are defined but not equal', () => {
    // given
    const constraint1 = clockConstraintFixtureWithClockNames('x');
    const constraint2 = clockConstraintFixtureWithClockNames('y');

    // when
    const areEqual = clockConstraintsEqual(constraint1, constraint2);

    // then
    expect(areEqual).toBe(false);
  });

  test('clockConstraintsEqual returns false when exactly one constraint is defined', () => {
    // given
    const constraintDefined = clockConstraintFixtureWithSingleClause();

    // when
    const areEqual = clockConstraintsEqual(constraintDefined, undefined);

    // then
    expect(areEqual).toBe(false);
  });

  test('clockConstraintsEqual returns true when both constraints are undefined', () => {
    // when
    const areEqual = clockConstraintsEqual(undefined, undefined);

    // then
    expect(areEqual).toBe(true);
  });

  test('transformToClockConstraint returns undefined when clauseData is empty', () => {
    // given
    const emptyClauseData: ClauseViewData[] = [];

    // when
    const clockConstraint = transformToClockConstraint(emptyClauseData);

    // then
    expect(clockConstraint).toBeUndefined();
  });

  test('transformToClockConstraint returns the correct clock constraint when the input array has a single element', () => {
    // given
    const singleClauseData = [clauseViewDataFixtureSomeValidViewData()];

    // when
    const clockConstraint = transformToClockConstraint(singleClauseData);

    // then
    expect(clockConstraint?.clauses).toHaveLength(1);
    expectClauseViewDataToBeEquivalentToClause(singleClauseData[0], clockConstraint!.clauses[0]);
  });

  test('transformToClockConstraint returns the correct clock constraint when the input array has multiple elements', () => {
    // given
    const clauseData0 = clauseViewDataFixtureValidViewDataWithClockName('x');
    const clauseData1 = clauseViewDataFixtureValidViewDataWithClockName('y');
    const clauseData = [clauseData0, clauseData1];

    // when
    const clockConstraint = transformToClockConstraint(clauseData);

    // then
    expect(clockConstraint?.clauses).toHaveLength(2);
    expectClauseViewDataToBeEquivalentToClause(clauseData0, clockConstraint!.clauses[0]);
    expectClauseViewDataToBeEquivalentToClause(clauseData1, clockConstraint!.clauses[1]);
  });

  test('constraintUsesClock returns true when the clock is used in the constraint', () => {
    // given
    const clock = clockFixtureAClock();
    const constraint = clockConstraintFixtureWithClockNames(clock.name);

    // when
    const usesClock = constraintUsesClock(clock.name, constraint);

    // then
    expect(usesClock).toBe(true);
  });

  test('constraintUsesClock returns false when the clock is not used in the constraint', () => {
    // given
    const clock = clockFixtureAClock();
    const constraint = clockConstraintFixtureWithClockNames(clock.name + 'unused');

    // when
    const usesClock = constraintUsesClock(clock.name, constraint);

    // then
    expect(usesClock).toBe(false);
  });

  test('constraintUsesClock returns false when the constraint is undefined', () => {
    // when
    const usesClock = constraintUsesClock('clock', undefined);

    // then
    expect(usesClock).toBe(false);
  });

  test('taUsesClockInAnyConstraint returns true when the TA uses the clock in a guard', () => {
    // given
    const clock = clockFixtureAClock();
    const guard = clockConstraintFixtureWithClockNames(clock.name);
    const ta = taFixtureWithTwoLocationsAndTwoSwitches();
    ta.switches[0].guard = guard;

    // when
    const usesClock = taUsesClockInAnyConstraint(ta, clock);

    // then
    expect(usesClock).toBe(true);
  });

  test('taUsesClockInAnyConstraint returns true when the TA uses the clock in an invariant', () => {
    // given
    const clock = clockFixtureAClock();
    const invariant = clockConstraintFixtureWithClockNames(clock.name);
    const ta = taFixtureWithTwoLocationsAndTwoSwitches();
    ta.locations[0].invariant = invariant;

    // when
    const usesClock = taUsesClockInAnyConstraint(ta, clock);

    // then
    expect(usesClock).toBe(true);
  });

  test('taUsesClockInAnyConstraint returns false when the TA does not use the clock in any constraint', () => {
    // given
    const ta = taFixtureWithTwoLocationsAndTwoSwitches();
    const unusedClock = clockFixtureWithClockName('unused');

    // when
    const usesClock = taUsesClockInAnyConstraint(ta, unusedClock);

    // then
    expect(usesClock).toBe(false);
  });

  test('taUsesClockInAnyConstraint returns false when the TA is undefined', () => {
    // given
    const clock = clockFixtureAClock();

    // when
    const usesClock = taUsesClockInAnyConstraint(undefined, clock);

    // then
    expect(usesClock).toBe(false);
  });

  test('taUsesClockInAnyConstraint returns false when the clock is undefined', () => {
    // given
    const ta = taFixtureWithTwoLocationsAndTwoSwitches();

    // when
    const usesClock = taUsesClockInAnyConstraint(ta, undefined);

    // then
    expect(usesClock).toBe(false);
  });

  test('removeAllClausesUsingClock removes all clauses containing the clock from guards when guards contain the clock', () => {
    // given
    const clock = clockFixtureAClock();
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(clock);

    // when
    removeAllClausesUsingClock(clock, ta);

    // then
    const guardsWithClock = ta.switches.map((sw) => sw.guard).filter((cc) => constraintUsesClock(clock.name, cc));
    expect(guardsWithClock.length).toBe(0);
  });

  test('removeAllClausesUsingClock removes all clauses containing the clock from invariants when invariants contain the clock', () => {
    // given
    const clock = clockFixtureAClock();
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(clock);

    // when
    removeAllClausesUsingClock(clock, ta);

    // then
    const invariantsWithClock = ta.locations
      .map((loc) => loc.invariant)
      .filter((cc) => constraintUsesClock(clock.name, cc));
    expect(invariantsWithClock.length).toBe(0);
  });

  test('removeAllClausesUsingClock does not change the TA when the clock is not used in any constraint', () => {
    // given
    const clock = clockFixtureAClock();
    const unusedClock = clockFixtureWithClockName(clock.name + 'unused');
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(clock);

    // when
    removeAllClausesUsingClock(unusedClock, ta);

    // then
    const numberOfConstraintsWithClock = [
      ...ta.locations.map((loc) => loc.invariant),
      ...ta.switches.map((sw) => sw.guard),
    ].filter((cc) => constraintUsesClock(clock.name, cc)).length;
    expect(numberOfConstraintsWithClock).toBeGreaterThan(0);
  });
});

function expectClauseViewDataToBeEquivalentToClause(clauseViewData: ClauseViewData, clause: Clause) {
  expect(clauseViewData.clockValue).toBe(clause.lhs.name);
  expect(clauseViewData.comparisonValue).toBe(clause.op);
  expect(parseInt(clauseViewData.numberInput)).toBe(clause.rhs);
}
