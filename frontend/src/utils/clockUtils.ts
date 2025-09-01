import { useCallback } from 'react';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { useClockConstraintUtils } from './clockConstraintUtils';
import { Clock } from '../model/ta/clock';

interface ClockUtils {
  renameClock: (oldClockName: string, newClockName: string, ta: TimedAutomaton) => void;
}

export function useClockUtils(): ClockUtils {
  const { constraintUsesClock } = useClockConstraintUtils();

  const renameClock = useCallback(
    (oldClockName: string, newClockName: string, ta: TimedAutomaton) => {
      const { locations, switches, clocks } = ta;
      const oldClock = clocks.filter((clock) => clock.name === oldClockName)[0];
      const newClock: Clock = { name: newClockName, size: oldClock.size };

      // update clock
      const clockIndex = clocks.map((c) => c.name).indexOf(oldClockName);
      clocks[clockIndex] = newClock;

      // update resets
      switches
        .map((sw) => sw.reset)
        .forEach((reset) => {
          if (reset.filter((r) => r.name === oldClockName).length > 0) {
            const index = reset.map((r) => r.name).indexOf(oldClockName);
            reset[index] = newClock;
          }
        });

      // update clock constraints
      const guardsToUpdate = switches.map((sw) => sw.guard).filter((g) => constraintUsesClock(oldClockName, g));
      const invariantsToUpdate = locations.map((l) => l.invariant).filter((l) => constraintUsesClock(oldClockName, l));
      // update alle clauses using the old clock name
      [...guardsToUpdate, ...invariantsToUpdate]
        .filter((cc) => cc !== undefined)
        .map((cc) => cc!.clauses)
        .flat()
        .filter((clause) => clause.lhs.name === oldClockName)
        .forEach((clause) => {
          clause.lhs = newClock;
        });
    },
    [constraintUsesClock]
  );

  return { renameClock: renameClock };
}
