import { TEST_BASE_URL } from './helper/endToEndTestConstants';
import { test } from './helper/testOptions';
import { expect } from '@playwright/test';
import { SwitchFixture } from '../test/fixture/switchFixture';
import { Switch } from '../src/model/ta/switch';
import { ClockConstraintFixture } from '../test/fixture/clockConstraintFixture';

test.describe('While manipulating switches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('the TA contains the correct set of switches when a switch is added', async ({ switchUiHelper }) => {
    // given
    const sw = SwitchFixture.aSwitch();
    const initSwitchNumber = await switchUiHelper.readNumberOfSwitchesFromUi();

    // when
    await switchUiHelper.addSwitch(sw);

    // then
    const switches = await switchUiHelper.readSwitchesFromUi();
    expect(switches.length, 'number of switches should have increased by 1').toBe(initSwitchNumber + 1);
    expect(switches, 'freshly added switch should actually be in the list').toContainEqual(sw);
  });

  test('the TA contains the correct set of switches when a switch is deleted', async ({ switchUiHelper }) => {
    // given
    const sw = SwitchFixture.aSwitch();
    await switchUiHelper.addSwitch(sw);
    const initSwitchNumber = await switchUiHelper.readNumberOfSwitchesFromUi();

    // when
    await switchUiHelper.deleteSwitchByActionLabel(sw.actionLabel);

    // then
    expect(await switchUiHelper.readNumberOfSwitchesFromUi(), 'number of switches should have decreased by 1').toBe(
      initSwitchNumber - 1
    );
    expect(
      await switchUiHelper.readSwitchesFromUi(),
      'freshly deleted switch should not be in the list'
    ).not.toContainEqual(sw);
  });

  test('the TA contains the correct set of switches when a switch is edited', async ({ switchUiHelper }) => {
    // given
    const oldSwitch = SwitchFixture.aSwitch();
    await switchUiHelper.addSwitch(oldSwitch);
    const newClockName = 'clock1New';
    const newSwitch: Switch = {
      source: oldSwitch.target,
      actionLabel: oldSwitch.actionLabel + 'new',
      guard: ClockConstraintFixture.withClockNames(newClockName),
      reset: [{ name: newClockName }],
      target: oldSwitch.source,
    };

    // when
    await switchUiHelper.editSwitchByActionLabel(oldSwitch.actionLabel, newSwitch);

    // then
    const switches = await switchUiHelper.readSwitchesFromUi();
    expect(switches, 'new switch should be in the list').toContainEqual(newSwitch);
    expect(switches, 'old switch should not be in the list').not.toContainEqual(oldSwitch);
  });
});
