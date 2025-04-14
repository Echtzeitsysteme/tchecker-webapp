import { TEST_BASE_URL } from './helper/endToEndTestConstants';
import { test } from './helper/testOptions';
import { expect } from '@playwright/test';
import { Location } from '../src/model/ta/location';
import { LocationFixture } from '../test/fixture/locationFixture';

test.describe('While manipulating locations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_BASE_URL);
  });

  test('the TA contains the correct set of locations when a location is added', async ({ locationUiHelper }) => {
    // given
    const location: Location = LocationFixture.initWithMultiClauseInvariant();
    const initLocationNumber = await locationUiHelper.readNumberOfLocationsFromUi();

    // when
    await locationUiHelper.addLocation(location);

    // then
    const locations = await locationUiHelper.readLocationsFromUi();
    expect(await locationUiHelper.readNumberOfLocationsFromUi(), 'number of locations should have increased by 1').toBe(
      initLocationNumber + 1
    );
    expect(locations, 'freshly added location should actually be in the list').toContainEqual(location);
  });

  test('the TA contains the correct set of locations when a location is deleted', async ({ locationUiHelper }) => {
    // given
    const location = LocationFixture.withoutInvariant();
    await locationUiHelper.addLocation(location);
    const initLocNumber = await locationUiHelper.readNumberOfLocationsFromUi();

    // when
    await locationUiHelper.deleteLocationByName(location.name);

    // then
    expect(await locationUiHelper.readNumberOfLocationsFromUi(), 'number of locations should have decreased by 1').toBe(
      initLocNumber - 1
    );
    expect(
      await locationUiHelper.readLocationsFromUi(),
      'freshly deleted location should not be in the list'
    ).not.toContainEqual(location);
  });

  test('the TA contains the correct set of locations when a location is edited', async ({ locationUiHelper }) => {
    // given
    const oldLocation = LocationFixture.withoutInvariant();
    await locationUiHelper.addLocation(oldLocation);
    const newLocation = { ...LocationFixture.initWithMultiClauseInvariant(), name: oldLocation.name + 'new' };

    // when
    await locationUiHelper.editLocation(oldLocation.name, newLocation);

    // then
    const locations = await locationUiHelper.readLocationsFromUi();
    expect(locations, 'new location should be in the list').toContainEqual(newLocation);
    expect(locations, 'old location should not be in the list').not.toContainEqual(oldLocation);
  });
});
