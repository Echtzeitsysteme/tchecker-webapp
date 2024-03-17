import { ClockConstraint } from "./ClockConstraint";
import { Action } from "./action";
import { Clock } from "./clock";

export interface Switch {
  source: Location;
  guard?: ClockConstraint;
  action: Action;
  reset: Clock[];
  target: Location;
}
