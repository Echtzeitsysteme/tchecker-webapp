import { Action } from "./action";
import { Clock } from "./clock";
import { Switch } from "./switch";

export interface TimedAutomaton {
  locations: Location[];
  initialLocation: Location;
  actions: Action[];
  clocks: Clock[];
  switches: Switch[];
}
