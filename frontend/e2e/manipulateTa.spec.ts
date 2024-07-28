import { TEST_BASE_URL } from './helper/endToEndTestConstants';
import { test } from './helper/testOptions';
import { taFixtureWithTwoLocationsAndTwoSwitches } from '../test/fixture/timedAutomatonFixture';
import { expect } from '@playwright/test';

test.describe('While manipulating a TA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('the TA contains the corrects sets of locations, switches, and clocks when all of these elements are manipulated', async ({
    taUiHelper,
  }) => {
    // given
    const ta = taFixtureWithTwoLocationsAndTwoSwitches();

    // when
    await taUiHelper.setTimedAutomatonTo(ta);

    // then
    const taFromUi = await taUiHelper.readTaFromUi();
    expect(taFromUi, 'TA from UI should be equal to the TA that was set in this test').toEqual(ta);
  });
});
