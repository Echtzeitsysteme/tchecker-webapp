import { ClockConstraint } from './clockConstraint';

export interface Location {
  name: string;
  invariant?: ClockConstraint;
}
