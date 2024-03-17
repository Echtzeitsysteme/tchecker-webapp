import { ClockConstraint } from './ClockConstraint';

export interface Location {
  name: string;
  invariant?: ClockConstraint;
}
