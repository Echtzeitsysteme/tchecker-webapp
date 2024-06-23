import { renderHook } from '@testing-library/react';
import { TimedAutomaton } from '../../src/model/ta/timedAutomaton';
import { useClockUtils } from '../../src/utils/clockUtils';
import { Clock } from '../../src/model/ta/clock';
import { taFixtureWithTwoLocationsAndTwoSwitchesAndClock } from '../fixture/timedAutomatonFixture';

describe('clockUtils', () => {
  // define and import all util functions once before starting as import is more complicated due to the use of hooks
  let renameClock: (oldClockName: string, newClockName: string, ta: TimedAutomaton) => void;

  beforeAll(() => {
    const { result } = renderHook(() => useClockUtils());
    renameClock = result.current.renameClock;
  });

  test('renameClock renames all clock occurences in the resets', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    const originalOccurrencesInResets = ta.switches
      .map((sw) => sw.reset)
      .flat()
      .filter((r) => r.name === oldClock.name).length;

    // when
    renameClock(oldClock.name, newClockName, ta);

    // then
    const newOccurrencesInResets = ta.switches
      .map((sw) => sw.reset)
      .flat()
      .filter((r) => r.name === newClockName).length;
    expect(newOccurrencesInResets).toBe(originalOccurrencesInResets);

    const oldOccurrencesInResets = ta.switches
      .map((sw) => sw.reset)
      .flat()
      .filter((r) => r.name === oldClock.name).length;
    expect(oldOccurrencesInResets).toBe(0);
  });

  test('renameClock renames all clock occurences in the guards', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    const originalOccurrencesInGuards = ta.switches
      .map((sw) => sw.guard)
      .flat()
      .filter((g) => g !== undefined)
      .filter((g) => g!.clauses.some((c) => c.lhs.name === oldClock.name)).length;

    // when
    renameClock(oldClock.name, newClockName, ta);

    // then
    const newOccurencesInGuards = ta.switches
      .map((sw) => sw.guard)
      .flat()
      .filter((g) => g !== undefined)
      .filter((g) => g!.clauses.some((c) => c.lhs.name === newClockName)).length;
    expect(newOccurencesInGuards).toBe(originalOccurrencesInGuards);

    const oldOccurencesInGuards = ta.switches
      .map((sw) => sw.guard)
      .flat()
      .filter((g) => g !== undefined)
      .filter((g) => g!.clauses.some((c) => c.lhs.name === oldClock.name)).length;
    expect(oldOccurencesInGuards).toBe(0);
  });

  test('renameClock renames all clock occurences in the invariants', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    const originalOccurrencesInInvariants = ta.locations
      .map((l) => l.invariant)
      .flat()
      .filter((i) => i !== undefined)
      .filter((i) => i!.clauses.some((c) => c.lhs.name === oldClock.name)).length;

    // when
    renameClock(oldClock.name, newClockName, ta);

    // then
    const newOccurrencesInInvariants = ta.locations
      .map((l) => l.invariant)
      .flat()
      .filter((i) => i !== undefined)
      .filter((i) => i!.clauses.some((c) => c.lhs.name === newClockName)).length;
    expect(newOccurrencesInInvariants).toBe(originalOccurrencesInInvariants);

    const oldOccurrencesInResets = ta.locations
      .map((l) => l.invariant)
      .flat()
      .filter((i) => i !== undefined)
      .filter((i) => i!.clauses.some((c) => c.lhs.name === oldClock.name)).length;
    expect(oldOccurrencesInResets).toBe(0);
  });

  test('renameClock renames all the clock in the set of clocks', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    // when
    renameClock(oldClock.name, newClockName, ta);

    // then
    const clockNames = ta.clocks.map((c) => c.name);
    expect(clockNames).toContain(newClockName);
    expect(clockNames).not.toContain(oldClock.name);
  });

  test('renameClock does not change clock name in set of clocks when clock name does not occur', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const nonExistingClockName = 'nonExistintClock';
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    // when
    renameClock(nonExistingClockName, newClockName, ta);

    // then
    const clockNames = ta.clocks.map((c) => c.name);
    expect(clockNames).toContain(oldClock.name);
    expect(clockNames).not.toContain(newClockName);
  });

  test('renameClock does not change clock name in resets when clock name does not occur', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const nonExistingClockName = 'nonExistintClock';
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    // when
    renameClock(nonExistingClockName, newClockName, ta);

    // then
    const clockNamesInResets = ta.switches
      .map((sw) => sw.reset)
      .flat()
      .map((c) => c.name);
    expect(clockNamesInResets).toContain(oldClock.name);
    expect(clockNamesInResets).not.toContain(newClockName);
  });

  test('renameClock does not change clock name in guards when clock name does not occur', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const nonExistingClockName = 'nonExistintClock';
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    // when
    renameClock(nonExistingClockName, newClockName, ta);

    // then
    const clockNamesInGuards = ta.switches
      .map((sw) => sw.guard)
      .flat()
      .filter((g) => g !== undefined)
      .map((g) => g!.clauses)
      .flat()
      .map((c) => c.lhs.name);
    expect(clockNamesInGuards).toContain(oldClock.name);
    expect(clockNamesInGuards).not.toContain(newClockName);
  });

  test('renameClock does not change clock name in invariants when clock name does not occur', () => {
    // given
    const oldClock: Clock = { name: 'c' };
    const nonExistingClockName = 'nonExistintClock';
    const newClockName = 'newClock';
    const ta = taFixtureWithTwoLocationsAndTwoSwitchesAndClock(oldClock);

    // when
    renameClock(nonExistingClockName, newClockName, ta);

    // then
    const clockNamesInInvariants = ta.locations
      .map((l) => l.invariant)
      .flat()
      .filter((i) => i !== undefined)
      .map((i) => i!.clauses)
      .flat()
      .map((c) => c.lhs.name);
    expect(clockNamesInInvariants).toContain(oldClock.name);
    expect(clockNamesInInvariants).not.toContain(newClockName);
  });
});
