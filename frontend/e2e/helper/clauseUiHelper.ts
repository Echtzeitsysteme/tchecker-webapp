import { Page } from '@playwright/test';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { Clause } from '../../src/model/ta/clause';
import { UtilHelper } from './utilHelper';

export class ClauseUiHelper {
  readonly page: Page;
  readonly utilHelper: UtilHelper;

  constructor(page: Page, utilHelper: UtilHelper) {
    this.page = page;
    this.utilHelper = utilHelper;
  }

  async readNumberOfClausesFromUi(): Promise<number> {
    return await this.utilHelper.readNumberOfElementsWithPartialTestId('button-delete-clause-row-');
  }

  async setClausesTo(clockConstraint: ClockConstraint): Promise<void> {
    const clauses = clockConstraint.clauses;
    await this.setNumberOfClauseRows(clauses.length);
    for (let i = 0; i < clauses.length; i++) {
      await this.setClauseRowTo(clauses[i], i);
    }
  }

  private async setNumberOfClauseRows(numberOfClauses: number): Promise<void> {
    // remove rows if there are more than needed
    const allClauseDeleteButtons = await this.utilHelper.findAllElementsWithPartialTestId('button-delete-clause-row-');
    for (let i = await this.readNumberOfClausesFromUi(); i > numberOfClauses; i--) {
      await allClauseDeleteButtons[i - 1].click();
    }
    // add rows if there are less than needed
    for (let i = await this.readNumberOfClausesFromUi(); i < numberOfClauses; i++) {
      await this.page.getByTestId('button-add-clause').click();
    }
  }

  private async setClauseRowTo(clause: Clause, row: number): Promise<void> {
    (await this.page.getByTestId('select-clock-row').all())[row].click();
    await this.page.getByTestId(`menu-item-clock-${clause.lhs.name}`).click();

    (await this.page.getByTestId('select-comparison-row').all())[row].click();
    await this.page.getByTestId(`menu-item-comparison-${clause.op}`).click();

    (await this.page.getByTestId('select-comparison-number-row').all())[row]
      .locator('input')
      .fill(clause.rhs.toString());
  }
}
