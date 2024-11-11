import { useCallback } from 'react';
import { Clause } from '../model/ta/clause';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClauseViewData } from '../viewmodel/ClausesViewModel';
import { Clock } from '../model/ta/clock';
import { ClockComparator } from '../model/ta/clockComparator';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { FreeClauseViewData } from '../viewmodel/FreeClausesViewModel.ts';
import { FreeClause } from '../model/ta/freeClause.ts';

export interface ClockConstraintUtils {
  clausesEqual: (clause1?: Clause, clause2?: Clause) => boolean;
  clockConstraintsEqual: (cc1?: ClockConstraint, cc2?: ClockConstraint) => boolean;
  transformToClockConstraint: (
    clauseData: ClauseViewData[],
    freeClauseData: FreeClauseViewData[]
  ) => ClockConstraint | undefined;
  constraintUsesClock: (clockName: string, clockConstraint?: ClockConstraint) => boolean;
  taUsesClockInAnyConstraint: (ta?: TimedAutomaton, clock?: Clock) => boolean;
  removeAllClausesUsingClock: (clock: Clock, ta: TimedAutomaton) => void;
}

export function useClockConstraintUtils(): ClockConstraintUtils {
  const clausesEqual = useCallback((clause1?: Clause, clause2?: Clause): boolean => {
    if (!clause1 && !clause2) {
      // if both clauses are falsy
      return true;
    }
    if (!clause1 || !clause2) {
      // if one clause is falsy
      return false;
    }
    return clause1.lhs.name === clause2.lhs.name && clause1.op === clause2.op && clause1.rhs === clause2.rhs;
  }, []);

  const clockConstraintsEqual = useCallback(
    (cc1?: ClockConstraint, cc2?: ClockConstraint): boolean => {
      if (!cc1 && !cc2) {
        // if both constraints are falsy
        return true;
      }
      if (!cc1 || !cc2) {
        // if one constraint is falsy
        return false;
      }

      const clauses1 = cc1.clauses;
      const clauses2 = cc2.clauses;
      if (clauses1.length !== clauses2.length) {
        return false;
      }

      // every clause of clauses1 contained in clauses2?
      for (const clauseOf1 of clauses1) {
        let containedIn2 = false;
        clauses2.forEach((clauseOf2) => {
          if (clausesEqual(clauseOf1, clauseOf2)) {
            containedIn2 = true;
          }
        });
        if (!containedIn2) {
          return false;
        }
      }

      // every clause of clauses2 contained in clauses1?
      for (const clauseOf2 of clauses2) {
        let containedIn1 = false;
        clauses1.forEach((clauseOf1) => {
          if (clausesEqual(clauseOf1, clauseOf2)) {
            containedIn1 = true;
          }
        });
        if (!containedIn1) {
          return false;
        }
      }

      return true;
    },
    [clausesEqual]
  );

  const transformToClockConstraint = useCallback(
    (clauseData: ClauseViewData[], freeClauseData: FreeClauseViewData[]): ClockConstraint | undefined => {
      // either clauseData or freeClauseData array should be defined
      if ((!clauseData && !freeClauseData) || (clauseData.length === 0 && freeClauseData.length === 0)) {
        return undefined;
      }

      // every element of clauseData array should be defined
      let emptyClause: boolean = false;
      for (const element of clauseData) {
        if (!element.clockValue || !element.comparisonValue || !element.numberInput) {
          emptyClause = true;
        }
      }

      //TODO assuming clock in non-free Clause can only be 1?
      const clockSize = 1;
      if (!emptyClause) {
        const guard = clauseData
          .map<Clause>((c) => {
            const lhs: Clock = { name: c.clockValue, size: clockSize };
            const op: ClockComparator | undefined = Object.values(ClockComparator).find(
              (value) => value === c.comparisonValue
            );
            if (op === undefined) {
              throw new Error(`Invalid comparison value: ${c.comparisonValue}`);
            }
            const rhs: number = parseInt(c.numberInput);
            const clause: Clause = { lhs, op, rhs };
            return clause;
          })
          .reduce<ClockConstraint>(
            (accumulator, current) => {
              accumulator.clauses.push(current);
              return accumulator;
            },
            { clauses: [], freeClauses: [] }
          );
        if (freeClauseData && freeClauseData.length >= 0) {
          freeClauseData.forEach((c) => {
            const freeClause: FreeClause = { term: c.term.trim() };
            guard.freeClauses.push(freeClause);
          });
        }
        return guard;
      } else {
        const guard: ClockConstraint = { clauses: [], freeClauses: [] };
        if (freeClauseData && freeClauseData.length >= 0) {
          freeClauseData.forEach((c) => {
            const freeClause: FreeClause = { term: c.term.trim() };
            guard.freeClauses.push(freeClause);
          });
        }
        return guard;
      }
    },
    []
  );

  const constraintUsesClock = useCallback((clockName: string, clockConstraint?: ClockConstraint): boolean => {
    if (!clockConstraint) {
      return false;
    }

    const includedClockNames = clockConstraint.clauses.map<string>((clause) => clause.lhs.name);
    return includedClockNames.includes(clockName);
  }, []);

  const taUsesClockInAnyConstraint = useCallback(
    (ta?: TimedAutomaton, clock?: Clock): boolean => {
      if (!clock || !ta) {
        return false;
      }

      const allInvariants = ta.locations.map<ClockConstraint | undefined>((loc) => loc.invariant);
      const allGuards = ta.switches.map<ClockConstraint | undefined>((sw) => sw.guard);
      return [...allInvariants, ...allGuards].filter((cc) => constraintUsesClock(clock.name, cc)).length > 0;
    },
    [constraintUsesClock]
  );

  const removeAllClausesUsingClock = useCallback(
    (clock: Clock, ta: TimedAutomaton): void => {
      if (!taUsesClockInAnyConstraint(ta, clock)) {
        return;
      }

      for (const loc of ta.locations) {
        if (loc.invariant && constraintUsesClock(clock.name, loc.invariant)) {
          const updatedClauses = loc.invariant.clauses.filter((clause) => clause.lhs.name !== clock.name);
          if (updatedClauses.length > 0) {
            loc.invariant.clauses = updatedClauses;
          } else {
            loc.invariant = undefined;
          }
        }
      }

      for (const sw of ta.switches) {
        if (sw.guard && constraintUsesClock(clock.name, sw.guard)) {
          const updatedClauses = sw.guard.clauses.filter((clause) => clause.lhs.name !== clock.name);
          if (updatedClauses.length > 0) {
            sw.guard.clauses = updatedClauses;
          } else {
            sw.guard = undefined;
          }
        }
      }
    },
    [constraintUsesClock, taUsesClockInAnyConstraint]
  );

  return {
    clausesEqual: clausesEqual,
    clockConstraintsEqual: clockConstraintsEqual,
    transformToClockConstraint: transformToClockConstraint,
    constraintUsesClock: constraintUsesClock,
    taUsesClockInAnyConstraint: taUsesClockInAnyConstraint,
    removeAllClausesUsingClock: removeAllClausesUsingClock,
  };
}
