import { renderHook } from '@testing-library/react';
import { useFormattingUtils } from '../../src/utils/formattingUtils';
import {
  clockConstraintFixtureWithClockNames,
  clockConstraintFixtureWithEmptyClauses,
  clockConstraintFixtureWithMultipleClauses,
  clockConstraintFixtureWithSingleClause,
} from '../fixture/clockConstraintFixture';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { Clock } from '../../src/model/ta/clock';
import { Switch } from '../../src/model/ta/switch';
import { Location } from '../../src/model/ta/location';
import { locationFixtureWithInvariant, locationFixtureWithoutInvariant } from '../fixture/locationFixture';
import { switchFixtureWithResetAndGuard } from '../fixture/switchFixture';
import { ClockComparator } from '../../src/model/ta/clockComparator';

describe('formattingUtils', () => {
  // define and import all util functions once before starting as import is more complicated due to the use of hooks
  let formatClockConstraint: (clockConstraint?: ClockConstraint, clauseJoinStr?: string) => string | undefined;
  let formatReset: (clocks?: Clock[], compact?: boolean) => string | undefined;
  let formatLocationLabelVisual: (location: Location) => string;
  let formatSwitchTable: (sw: Switch) => string;
  let formatSwitchLabelVisual: (sw: Switch) => string;

  beforeAll(() => {
    const { result } = renderHook(() => useFormattingUtils());
    formatClockConstraint = result.current.formatClockConstraint;
    formatReset = result.current.formatReset;
    formatLocationLabelVisual = result.current.formatLocationLabelVisual;
    formatSwitchTable = result.current.formatSwitchTable;
    formatSwitchLabelVisual = result.current.formatSwitchLabelVisual;
  });

  test('formatClockConstraint formats clock constraint correctly when constraint has a single clause', () => {
    // given
    const clockConstraint = clockConstraintFixtureWithSingleClause();
    const clause = clockConstraint.clauses[0];
    const expectedFormatting = `${clause.lhs.name} ${clause.op} ${clause.rhs}`;

    // when
    const formattedConstraint = formatClockConstraint(clockConstraint);

    // then
    expect(formattedConstraint).toBe(expectedFormatting);
  });

  test('formatClockConstraint formats clock constraint correctly when constraint has multiple clauses', () => {
    // given
    const clockConstraint = clockConstraintFixtureWithMultipleClauses();
    const clause0 = clockConstraint.clauses[0];
    const clauseFormatting0 = `${clause0.lhs.name} ${clause0.op} ${clause0.rhs}`;
    const clause1 = clockConstraint.clauses[1];
    const clauseFormatting1 = `${clause1.lhs.name} ${clause1.op} ${clause1.rhs}`;
    const expectedFormatting = `${clauseFormatting0} ∧ ${clauseFormatting1}`;

    // when
    const formattedConstraint = formatClockConstraint(clockConstraint);

    // then
    expect(formattedConstraint).toBe(expectedFormatting);
  });

  test('formatClockConstraint returns undefined when clock constraint is undefined', () => {
    // when
    const formattedConstraint = formatClockConstraint(undefined);

    // then
    expect(formattedConstraint).toBeUndefined();
  });

  test('formatClockConstraint returns undefined when clock constraint has no clauses', () => {
    // given
    const clockConstraint = clockConstraintFixtureWithEmptyClauses();

    // when
    const formattedConstraint = formatClockConstraint(clockConstraint);

    // then
    expect(formattedConstraint).toBeUndefined();
  });

  test('formatReset formats reset correctly when reset has a single clock', () => {
    // given
    const clocks: Clock[] = [{ name: 'c' }];

    // when
    const formattedReset = formatReset(clocks);

    // then
    expect(formattedReset).toBe('{ c }');
  });

  test('formatReset formats reset correctly when reset has multiple clocks', () => {
    // given
    const clocks: Clock[] = [{ name: 'c1' }, { name: 'c2' }];

    // when
    const formattedReset = formatReset(clocks);

    // then
    expect(formattedReset).toBe('{ c1, c2 }');
  });

  test('formatReset returns undefined when reset is undefined', () => {
    // when
    const formattedReset = formatReset(undefined);

    // then
    expect(formattedReset).toBeUndefined();
  });

  test('formatReset formats reset correctly when result should be compact', () => {
    // given
    const clocks: Clock[] = [{ name: 'c1' }, { name: 'c2' }];

    // when
    const formattedReset = formatReset(clocks, true);

    // then
    expect(formattedReset).toBe('{c1,c2}');
  });

  test('formatLocationLabelVisual formats location label correctly when invariant is defined', () => {
    // given
    const location = locationFixtureWithInvariant();
    const expectedFormatting = `${location.name}\n${formatClockConstraint(location.invariant)}`;

    // when
    const formattedLocation = formatLocationLabelVisual(location);

    // then
    expect(formattedLocation).toBe(expectedFormatting);
  });

  test('formatLocationLabelVisual formats location label correctly when invariant is undefined', () => {
    // given
    const location = locationFixtureWithoutInvariant();

    // when
    const formattedLocation = formatLocationLabelVisual(location);

    // then
    expect(formattedLocation).toBe(location.name);
  });

  test('formatSwitchTable formats switch correctly when there is a guard', () => {
    // given
    const guard = clockConstraintFixtureWithSingleClause();
    const sw = switchFixtureWithResetAndGuard([], guard);
    const formattedGuard = formatClockConstraint(guard);
    const expectedFormatting = [sw.source.name, sw.actionLabel, formattedGuard, sw.target.name].join(', ');

    // when
    const formattedSwitch = formatSwitchTable(sw);

    // then
    expect(formattedSwitch).toBe(expectedFormatting);
  });

  test('formatSwitchTable formats switch correctly when there is no guard', () => {
    // given
    const sw = switchFixtureWithResetAndGuard([], undefined);

    // when
    const formattedSwitch = formatSwitchTable(sw);

    // then
    for (const clockComparator of Object.values(ClockComparator)) {
      expect(formattedSwitch).not.toContain(clockComparator);
    }
  });

  test('formatSwitchTable formats switch correctly when there is a reset', () => {
    // given
    const clock: Clock = { name: 'c' };
    const sw = switchFixtureWithResetAndGuard([clock], undefined);
    const expectedFormatting = [sw.source.name, sw.actionLabel, `{${clock.name}}`, sw.target.name].join(', ');

    // when
    const formattedSwitch = formatSwitchTable(sw);

    // then
    expect(formattedSwitch).toBe(expectedFormatting);
  });

  test('formatSwitchTable formats switch correctly when there is no reset', () => {
    // given
    const sw = switchFixtureWithResetAndGuard([], undefined);

    // when
    const formattedSwitch = formatSwitchTable(sw);

    // then
    expect(formattedSwitch).not.toContain('{');
    expect(formattedSwitch).not.toContain('}');
  });

  test('formatSwitchTable formats switch correctly when there is a guard and a reset', () => {
    // given
    const clock: Clock = { name: 'c' };
    const guard = clockConstraintFixtureWithClockNames(clock.name);
    const sw = switchFixtureWithResetAndGuard([clock], guard);
    const expectedFormatting = [
      sw.source.name,
      sw.actionLabel,
      formatClockConstraint(guard),
      `{${clock.name}}`,
      sw.target.name,
    ].join(', ');

    // when
    const formattedSwitch = formatSwitchTable(sw);

    // then
    expect(formattedSwitch).toBe(expectedFormatting);
  });

  test('formatSwitchLabelVisual formats switch correctly when there is a guard', () => {
    // given
    const guard = clockConstraintFixtureWithSingleClause();
    const sw = switchFixtureWithResetAndGuard([], guard);
    const formattedGuard = formatClockConstraint(guard);
    const expectedFormatting = `${sw.actionLabel}\n${formattedGuard}`;

    // when
    const formattedSwitch = formatSwitchLabelVisual(sw);

    // then
    expect(formattedSwitch).toBe(expectedFormatting);
  });

  test('formatSwitchLabelVisual formats switch correctly when there is no guard', () => {
    // given
    const sw = switchFixtureWithResetAndGuard([], undefined);

    // when
    const formattedSwitch = formatSwitchLabelVisual(sw);

    // then
    for (const clockComparator of Object.values(ClockComparator)) {
      expect(formattedSwitch).not.toContain(clockComparator);
    }
  });

  test('formatSwitchLabelVisual formats switch correctly when there is a reset', () => {
    // given
    const clock: Clock = { name: 'c' };
    const sw = switchFixtureWithResetAndGuard([clock], undefined);
    const expectedFormatting = `${sw.actionLabel}\n{ ${clock.name} }`;

    // when
    const formattedSwitch = formatSwitchLabelVisual(sw);

    // then
    expect(formattedSwitch).toBe(expectedFormatting);
  });

  test('formatSwitchLabelVisual formats switch correctly when there is no reset', () => {
    // given
    const sw = switchFixtureWithResetAndGuard([], undefined);

    // when
    const formattedSwitch = formatSwitchLabelVisual(sw);

    // then
    expect(formattedSwitch).not.toContain('{');
    expect(formattedSwitch).not.toContain('}');
  });

  test('formatSwitchLabelVisual formats switch correctly when there is a guard and a reset', () => {
    // given
    const clock: Clock = { name: 'c' };
    const guard = clockConstraintFixtureWithClockNames(clock.name);
    const sw = switchFixtureWithResetAndGuard([clock], guard);
    const expectedFormatting = [sw.actionLabel, formatClockConstraint(guard), `{ ${clock.name} }`].join('\n');

    // when
    const formattedSwitch = formatSwitchLabelVisual(sw);

    // then
    expect(formattedSwitch).toBe(expectedFormatting);
  });
});
