import { Action } from './action';
import { Clock } from './clock';
import { Switch } from './switch';
import { Location } from './location';

export interface TimedAutomaton {
  locations: Location[];
  actions: Action[];
  clocks: Clock[];
  switches: Switch[];
}
