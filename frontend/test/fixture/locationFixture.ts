import { Location } from '../../src/model/ta/location';
import { ClockConstraintFixture } from './clockConstraintFixture';

export class LocationFixture {
  static withoutInvariant(): Location {
    return LocationFixture.withName('loc');
  }

  static withInvariant(): Location {
    return { ...LocationFixture.withName('loc'), invariant: ClockConstraintFixture.withSingleClause() };
  }

  static withName(name: string): Location {
    return { name: name, isInitial: false, invariant: undefined, xCoordinate: 0, yCoordinate: 0 };
  }

  static initWithMultiClauseInvariant(): Location {
    return {
      ...LocationFixture.withName('loc'),
      invariant: ClockConstraintFixture.withMultipleClauses(),
      isInitial: true,
    };
  }
}
