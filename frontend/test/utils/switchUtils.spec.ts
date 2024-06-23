import { renderHook } from '@testing-library/react';
import { Clock } from '../../src/model/ta/clock';
import { Switch } from '../../src/model/ta/switch';
import { TimedAutomaton } from '../../src/model/ta/timedAutomaton';
import { useSwitchUtils } from '../../src/utils/switchUtils';
import { switchFixtureASwitch, switchFixtureWithResetAndGuard } from '../fixture/switchFixture';
import { clockConstraintFixtureWithClockNames } from '../fixture/clockConstraintFixture';
import { taFixtureWithTwoLocationsAndTwoSwitchesAndClock } from '../fixture/timedAutomatonFixture';

describe('switchUtils', () => {
  let switchesEqual: (switch1?: Switch, switch2?: Switch) => boolean;
  let removeClockFromAllResets: (clock: Clock, ta: TimedAutomaton) => void;

  beforeAll(() => {
    const { result } = renderHook(() => useSwitchUtils());
    switchesEqual = result.current.switchesEqual;
    removeClockFromAllResets = result.current.removeClockFromAllResets;
  });

  test('switchesEqual returns true when the switches are equal', () => {
    // given
    const sw1 = switchFixtureASwitch();
    const sw2 = switchFixtureASwitch();

    // when
    const areEqual = switchesEqual(sw1, sw2);

    // then
    expect(areEqual).toBe(true);
  });

  test('switchesEqual returns true when both switches are undefined', () => {
    // when
    const areEqual = switchesEqual(undefined, undefined);

    // then
    expect(areEqual).toBe(true);
  });

  test('switchesEqual returns false when one argument is undefined', () => {
    // given
    const sw = switchFixtureASwitch();

    // when
    const areEqualFirstUndefined = switchesEqual(undefined, sw);
    const areEqualSecondUndefined = switchesEqual(sw, undefined);

    // then
    expect(areEqualFirstUndefined).toBe(false);
    expect(areEqualSecondUndefined).toBe(false);
  });

  test('switchesEqual returns false when the sources are not equal', () => {
    // given
    const sw1 = switchFixtureASwitch();
    const sw2 = { ...sw1, source: { ...sw1.source, name: sw1.source.name + 'a' } };

    // when
    const areEqual = switchesEqual(sw1, sw2);

    // then
    expect(areEqual).toBe(false);
  });

  test('switchesEqual returns false when the targets are not equal', () => {
    // given
    const sw1 = switchFixtureASwitch();
    const sw2 = { ...sw1, target: { ...sw1.target, name: sw1.target.name + 'a' } };

    // when
    const areEqual = switchesEqual(sw1, sw2);

    // then
    expect(areEqual).toBe(false);
  });

  test('switchesEqual returns false when the actions are not equal', () => {
    // given
    const sw1 = switchFixtureASwitch();
    const sw2 = { ...sw1, actionLabel: sw1.actionLabel + 'a' };

    // when
    const areEqual = switchesEqual(sw1, sw2);

    // then
    expect(areEqual).toBe(false);
  });

  test('switchesEqual returns false when the guards are not equal', () => {
    // given
    const guard1 = clockConstraintFixtureWithClockNames('a');
    const guard2 = clockConstraintFixtureWithClockNames('a', 'b');
    const sw1 = switchFixtureWithResetAndGuard([], guard1);
    const sw2 = switchFixtureWithResetAndGuard([], guard2);

    // when
    const areEqual = switchesEqual(sw1, sw2);

    // then
    expect(areEqual).toBe(false);
  });

  test('switchesEqual returns false when the resets are not equal', () => {
    // given
    const sw1 = switchFixtureWithResetAndGuard([{ name: 'a' }], undefined);
    const sw2 = switchFixtureWithResetAndGuard([{ name: 'a' }, { name: 'b' }], undefined);

    // when
    const areEqual = switchesEqual(sw1, sw2);

    // then
    expect(areEqual).toBe(false);
  });

  test('removeClockFromAllResets removes correct clock from all resets when clock is in reset', () => {
    // given
    const clock: Clock = { name: 'c' };
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(clock);
    const { switches } = ta;
    const resetsInitial = switches.map((sw) => sw.reset).filter((r) => !!r && r.includes(clock)).length;

    // when
    removeClockFromAllResets(clock, ta);

    // then
    const resetsAfter = switches.map((sw) => sw.reset).filter((r) => !!r && r.includes(clock)).length;
    expect(resetsAfter).toBe(0);
    expect(resetsAfter).toBeLessThan(resetsInitial);
  });

  test('removeClockFromAllResets does nothing when clock is not used in any reset', () => {
    // given
    const clock: Clock = { name: 'c' };
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(clock);
    const { switches } = ta;
    const unusedClock: Clock = { name: clock.name + 'test' };

    // count resets
    const resetsInitial = switches.map((sw) => sw.reset).filter((r) => !!r && r.includes(clock)).length;

    // when
    removeClockFromAllResets(unusedClock, ta);

    // then
    const resetsAfter = switches.map((sw) => sw.reset).filter((r) => !!r && r.includes(clock)).length;
    expect(resetsAfter).toEqual(resetsInitial);
  });
});
