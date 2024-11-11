import { ClockConstraint } from './clockConstraint';
import { Clock } from './clock';
import { Location } from './location';
import { SwitchStatement } from "./switchStatement.ts";

export interface Switch {
  source: Location;
  guard?: ClockConstraint;
  actionLabel: string;
  reset: Clock[];
  statement?: SwitchStatement;
  target: Location;
}
