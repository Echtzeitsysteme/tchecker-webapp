import { Page } from '@playwright/test';
import { ClockConstraint } from '../../src/model/ta/clockConstraint';
import { parseClockComparator } from '../../src/model/ta/clockComparator';

export class ClockConstraintHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async parseClockConstraintFromUi(constraintString: string): Promise<ClockConstraint> {
    const clauseStrings = constraintString.split(' ∧ ');
    const clauses = clauseStrings.map((clauseString) => {
      const [lhs, op, rhs] = clauseString.split(' ');
      return { lhs: { name: lhs }, op: parseClockComparator(op), rhs: parseInt(rhs) };
    });
    return { clauses: clauses };
  }
}
