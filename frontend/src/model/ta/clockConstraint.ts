import { Clause } from './clause.ts';
import {FreeClause} from "./freeClause.ts";

export interface ClockConstraint {
  clauses: Clause[];
  freeClauses: FreeClause[];
}
