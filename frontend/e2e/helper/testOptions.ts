import { ClockUiHelper } from './clockUiHelper';
import { test as base } from '@playwright/test';
import { LocationUiHelper } from './locationUiHelper';
import { ClauseUiHelper } from './clauseUiHelper';
import { ClockConstraintHelper } from './clockConstraintHelper';
import { SwitchUiHelper } from './switchUiHelper';
import { UtilHelper } from './utilHelper';
import { TaUiHelper } from './taUiHelper';

export type TestOptions = {
  clockUiHelper: ClockUiHelper;
  locationUiHelper: LocationUiHelper;
  switchUiHelper: SwitchUiHelper;
  taUiHelper: TaUiHelper;
};

export const test = base.extend<TestOptions>({
  clockUiHelper: async ({ page }, use) => {
    await use(new ClockUiHelper(page, new UtilHelper(page)));
  },
  locationUiHelper: async ({ page }, use) => {
    await use(
      new LocationUiHelper(
        page,
        new UtilHelper(page),
        new ClockUiHelper(page, new UtilHelper(page)),
        new ClauseUiHelper(page, new UtilHelper(page)),
        new ClockConstraintHelper(page)
      )
    );
  },
  switchUiHelper: async ({ page }, use) => {
    await use(
      new SwitchUiHelper(
        page,
        new UtilHelper(page),
        new ClockUiHelper(page, new UtilHelper(page)),
        new ClauseUiHelper(page, new UtilHelper(page)),
        new LocationUiHelper(
          page,
          new UtilHelper(page),
          new ClockUiHelper(page, new UtilHelper(page)),
          new ClauseUiHelper(page, new UtilHelper(page)),
          new ClockConstraintHelper(page)
        ),
        new ClockConstraintHelper(page)
      )
    );
  },
  taUiHelper: async ({ page }, use) => {
    await use(
      new TaUiHelper(
        page,
        new LocationUiHelper(
          page,
          new UtilHelper(page),
          new ClockUiHelper(page, new UtilHelper(page)),
          new ClauseUiHelper(page, new UtilHelper(page)),
          new ClockConstraintHelper(page)
        ),
        new SwitchUiHelper(
          page,
          new UtilHelper(page),
          new ClockUiHelper(page, new UtilHelper(page)),
          new ClauseUiHelper(page, new UtilHelper(page)),
          new LocationUiHelper(
            page,
            new UtilHelper(page),
            new ClockUiHelper(page, new UtilHelper(page)),
            new ClauseUiHelper(page, new UtilHelper(page)),
            new ClockConstraintHelper(page)
          ),
          new ClockConstraintHelper(page)
        ),
        new ClockUiHelper(page, new UtilHelper(page))
      )
    );
  },
});
