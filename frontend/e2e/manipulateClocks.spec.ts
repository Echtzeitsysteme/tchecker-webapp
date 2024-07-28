import { TEST_BASE_URL } from './helper/endToEndTestConstants';
import { test } from './helper/testOptions';
import { expect } from '@playwright/test';
import { Clock } from '../src/model/ta/clock';
import { clockFixtureWithClockName } from '../test/fixture/clockFixture';

test.describe('While manipulating clocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('the TA contains the correct set of clocks when a clock is added', async ({ clockUiHelper }) => {
    // given
    const clock: Clock = clockFixtureWithClockName('myTestClock');
    const initClockNumber = await clockUiHelper.readNumberOfClocksFromUi();

    // when
    await clockUiHelper.addClock(clock.name);

    // then
    const clocks = await clockUiHelper.readClocksFromUi();
    expect(clocks.length, 'number of clocks should have increased by 1').toBe(initClockNumber + 1);
    expect(clocks, 'freshly added clock should actually be in the list').toContainEqual(clock);
  });

  test('the TA contains the correct set of clocks when a clock is deleted', async ({ clockUiHelper }) => {
    // given
    const clock: Clock = clockFixtureWithClockName('myTestClock');
    await clockUiHelper.addClock(clock.name);
    const initClockNumber = await clockUiHelper.readNumberOfClocksFromUi();

    // when
    await clockUiHelper.removeClockByName(clock.name);

    // then
    const clocks = await clockUiHelper.readClocksFromUi();
    expect(clocks.length, 'number of clocks should have decreased by 1').toBe(initClockNumber - 1);
    expect(clocks, 'deleted clock should not be in the list').not.toContainEqual(clock);
  });

  test('the TA contains the correct set of clocks when a clock is edited', async ({ clockUiHelper }) => {
    // given
    const oldClockName = 'myTestClock';
    const newClockName = 'myNewTestClock';
    const clock: Clock = clockFixtureWithClockName(oldClockName);
    await clockUiHelper.addClock(clock.name);

    // when
    await clockUiHelper.editClockName(oldClockName, newClockName);

    // then
    const clockNames = (await clockUiHelper.readClocksFromUi()).map((clock) => clock.name);
    expect(clockNames, 'new clock name should be in the list').toContainEqual(newClockName);
    expect(clockNames, 'old clock name should not be in the list').not.toContainEqual(oldClockName);
  });
});
