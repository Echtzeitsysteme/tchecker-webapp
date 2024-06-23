import { useCallback } from 'react';
import { Switch } from '../model/ta/switch';
import { useClockConstraintUtils } from './clockConstraintUtils';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { Clock } from '../model/ta/clock';

export interface SwitchUtils {
  switchesEqual: (switch1: Switch | undefined, switch2: Switch | undefined) => boolean;
  removeClockFromAllResets: (clock: Clock, ta: TimedAutomaton) => void;
}

export function useSwitchUtils(): SwitchUtils {
  const { clockConstraintsEqual } = useClockConstraintUtils();

  const switchesEqual = useCallback(
    (switch1: Switch | undefined, switch2: Switch | undefined): boolean => {
      if (!switch1 && !switch2) {
        // if both switches are undefined
        return true;
      }
      if (!switch1 || !switch2) {
        // if one switch is undefined
        return false;
      }

      if (switch1.source.name !== switch2.source.name) {
        return false;
      }
      if (switch1.target.name !== switch2.target.name) {
        return false;
      }
      if (switch1.actionLabel !== switch2.actionLabel) {
        return false;
      }
      if (!clockConstraintsEqual(switch1.guard, switch2.guard)) {
        return false;
      }

      const resets1 = switch1.reset.map((c) => c.name);
      const resets2 = switch2.reset.map((c) => c.name);
      if (resets1.filter((r1) => !resets2.includes(r1)).length > 0) {
        // some resets of switch1 are not included in switch1´
        return false;
      }
      if (resets2.filter((r2) => !resets1.includes(r2)).length > 0) {
        // some resets of switch2 are not included in switch1´
        return false;
      }

      // everything is equal === switches equal
      return true;
    },
    [clockConstraintsEqual]
  );

  const removeClockFromAllResets = useCallback((clock: Clock, ta: TimedAutomaton): void => {
    for (const sw of ta.switches) {
      sw.reset = sw.reset.filter((c) => c.name !== clock.name);
    }
  }, []);

  return { switchesEqual: switchesEqual, removeClockFromAllResets: removeClockFromAllResets };
}
