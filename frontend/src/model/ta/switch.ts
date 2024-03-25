import { ClockConstraint } from './clockConstraint';
import { Action } from './action';
import { Clock } from './clock';
import { Location } from './location';

export interface Switch {
  source: Location;
  guard?: ClockConstraint;
  action: Action;
  reset: Clock[];
  target: Location;
}
