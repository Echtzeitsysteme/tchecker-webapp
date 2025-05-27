import { Clock } from './clock';
import { Switch } from './switch';
import { Location } from './location';

export interface TimedAutomaton {
  locations: Location[];
  clocks: Clock[];
  switches: Switch[];
}
