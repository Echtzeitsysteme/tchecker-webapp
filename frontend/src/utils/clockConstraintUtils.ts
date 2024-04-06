import { useCallback } from 'react';
import { Clause } from '../model/ta/clause';
import { ClockConstraint } from '../model/ta/clockConstraint';

export interface ClockConstraintUtils {
  clausesEqual: (clause1?: Clause, clause2?: Clause) => boolean;
  clockConstraintsEqual: (cc1?: ClockConstraint, cc2?: ClockConstraint) => boolean;
}

export function useClockConstraintUtils(): ClockConstraintUtils {
  const clausesEqual = useCallback((clause1?: Clause, clause2?: Clause): boolean => {
    if (!clause1 && !clause2) {
      // if both clauses are undefined
      return true;
    }
    if (!clause1 || !clause2) {
      // if one clause is undefined
      return false;
    }
    return clause1.lhs === clause2.lhs && clause1.op === clause2.op && clause1.rhs === clause2.rhs;
  }, []);

  const clockConstraintsEqual = useCallback(
    (cc1?: ClockConstraint, cc2?: ClockConstraint): boolean => {
      if (!cc1 && !cc2) {
        // if both constraints are undefined
        return true;
      }
      if (!cc1 || !cc2) {
        // if one constraint is undefined
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
  return { clausesEqual: clausesEqual, clockConstraintsEqual: clockConstraintsEqual };
}
