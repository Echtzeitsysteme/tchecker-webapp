import { useCallback } from 'react';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { Clock } from '../model/ta/clock';
import { Switch } from '../model/ta/switch';
import { Location } from '../model/ta/location';

export interface FormattingUtils {
  formatClockConstraint: (clockConstraint?: ClockConstraint) => string | undefined;
  formatReset: (clocks?: Clock[]) => string | undefined;
  formatLocationLabelVisual: (location: Location) => string;
  formatSwitchTable: (sw: Switch) => string;
  formatSwitchLabelVisual: (sw: Switch) => string;
}

export function useFormattingUtils(): FormattingUtils {
  const formatClockConstraint = useCallback((clockConstraint?: ClockConstraint, clauseJoinStr: string = ' ∧ ') => {
    const cc = clockConstraint;
    if (!cc || !cc.clauses) {
      return undefined;
    }
    return cc.clauses.map((c) => `${c.lhs.name} ${c.op} ${c.rhs}`).join(clauseJoinStr);
  }, []);

  const formatReset = useCallback((clocks?: Clock[]) => {
    if (!clocks || clocks.length === 0) {
      return undefined;
    }
    return `{${clocks.map((c) => c.name).join(', ')}}`;
  }, []);

  const formatLocationLabelVisual = useCallback(
    (location: Location) => {
      const invariant = formatClockConstraint(location.invariant);
      return invariant ? `${location.name}\n${invariant}` : location.name;
    },
    [formatClockConstraint]
  );

  const formatSwitchTable = useCallback(
    (sw: Switch) => {
      const guard = formatClockConstraint(sw.guard);
      const reset = formatReset(sw.reset);
      return [sw.source.name, sw.actionLabel, guard, reset, sw.target.name].filter((e) => e !== undefined).join(', ');
    },
    [formatClockConstraint, formatReset]
  );

  const formatSwitchLabelVisual = useCallback(
    (sw: Switch) => {
      const guard = formatClockConstraint(sw.guard, ' ∧\n');
      const reset = formatReset(sw.reset);
      return [sw.actionLabel, guard, reset].filter((e) => e !== undefined).join('\n');
    },
    [formatClockConstraint, formatReset]
  );

  return {
    formatClockConstraint: formatClockConstraint,
    formatReset: formatReset,
    formatLocationLabelVisual: formatLocationLabelVisual,
    formatSwitchTable: formatSwitchTable,
    formatSwitchLabelVisual: formatSwitchLabelVisual,
  };
}
