import { ClockConstraint } from './clockConstraint';

export interface Location {
  name: string;
  isInitial?: boolean;
  invariant?: ClockConstraint;
}
