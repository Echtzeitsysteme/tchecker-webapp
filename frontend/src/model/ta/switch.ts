import { ClockConstraint } from './clockConstraint';
import { Clock } from './clock';
import { Location } from './location';

export interface Switch {
  source: Location;
  guard?: ClockConstraint;
  actionLabel: string;
  reset: Clock[];
  target: Location;
}
