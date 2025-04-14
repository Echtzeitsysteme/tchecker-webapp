import { Clock } from './clock';
import { ClockComparator } from './clockComparator';

export interface Clause {
  lhs: Clock; // lhs == left-hand side
  op: ClockComparator;
  rhs: number; // rhs == ride-hand side
}
