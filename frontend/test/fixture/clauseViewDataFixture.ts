import { ClockComparator } from '../../src/model/ta/clockComparator';
import { ClauseViewData } from '../../src/viewmodel/ClausesViewModel';

let idCounter = 0;

export class ClauseViewDataFixture {
  static validViewDataWithClockName(clockName: string): ClauseViewData {
    return {
      id: idCounter++,
      clockValue: clockName,
      comparisonValue: ClockComparator.LEQ,
      numberInput: '5',
      isClockInvalid: false,
      isComparisonInvalid: false,
      isNumberInvalid: false,
    };
  }

  static someValidViewData(): ClauseViewData {
    return ClauseViewDataFixture.validViewDataWithClockName('x');
  }
}
