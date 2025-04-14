import { Page } from '@playwright/test';
import { TimedAutomaton } from '../../src/model/ta/timedAutomaton';
import { LocationUiHelper } from './locationUiHelper';
import { ClockUiHelper } from './clockUiHelper';
import { SwitchUiHelper } from './switchUiHelper';

export class TaUiHelper {
  readonly page: Page;
  readonly locationUiHelper: LocationUiHelper;
  readonly switchUiHelper: SwitchUiHelper;
  readonly clockUiHelper: ClockUiHelper;

  constructor(
    page: Page,
    locationUiHelper: LocationUiHelper,
    switchUiHelper: SwitchUiHelper,
    clockUiHelper: ClockUiHelper
  ) {
    this.page = page;
    this.locationUiHelper = locationUiHelper;
    this.switchUiHelper = switchUiHelper;
    this.clockUiHelper = clockUiHelper;
  }

  async setTimedAutomatonTo(ta: TimedAutomaton): Promise<void> {
    await this.clockUiHelper.setClocksTo(ta.clocks);
    await this.locationUiHelper.setLocationsTo(ta.locations);
    await this.switchUiHelper.setSwitchesTo(ta.switches);
  }

  async readTaFromUi(): Promise<TimedAutomaton> {
    return {
      locations: await this.locationUiHelper.readLocationsFromUi(),
      clocks: await this.clockUiHelper.readClocksFromUi(),
      switches: await this.switchUiHelper.readSwitchesFromUi(),
    };
  }
}
