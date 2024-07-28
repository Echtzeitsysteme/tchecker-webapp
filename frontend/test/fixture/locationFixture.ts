import { Location } from '../../src/model/ta/location';
import {
  clockConstraintFixtureWithMultipleClauses,
  clockConstraintFixtureWithSingleClause,
} from './clockConstraintFixture';

export function locationFixtureWithoutInvariant(): Location {
  return locationFixtureWithName('loc');
}

export function locationFixtureWithInvariant(): Location {
  return { ...locationFixtureWithName('loc'), invariant: clockConstraintFixtureWithSingleClause() };
}

export function locationFixtureWithName(name: string): Location {
  return { name: name, isInitial: false, invariant: undefined, xCoordinate: 0, yCoordinate: 0 };
}

export function locationFixtureInitWithMultiClauseInvariant(): Location {
  return {
    ...locationFixtureWithName('loc'),
    invariant: clockConstraintFixtureWithMultipleClauses(),
    isInitial: true,
  };
}
