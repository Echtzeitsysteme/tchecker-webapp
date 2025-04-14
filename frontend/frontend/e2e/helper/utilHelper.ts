import { ElementHandle, Page } from '@playwright/test';

export class UtilHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async readNumberOfElementsWithPartialTestId(partialTestId: string): Promise<number> {
    return (await this.findAllElementsWithPartialTestId(partialTestId)).length;
  }

  async findAllElementsWithPartialTestId(partialTestId: string): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    // briefly pause to ensure that all elements are loaded
    await this.page.waitForTimeout(100);
    return await this.page.$$(`[data-testid^="${partialTestId}"]`);
  }
}
