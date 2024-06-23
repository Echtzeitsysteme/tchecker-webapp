import { Location } from '../../src/model/ta/location';
import { clockConstraintFixtureWithSingleClause } from './clockConstraintFixture';

export function locationFixtureWithoutInvariant(): Location {
  return locationFixtureWithName('loc');
}

export function locationFixtureWithInvariant(): Location {
  return { ...locationFixtureWithName('loc'), invariant: clockConstraintFixtureWithSingleClause() };
}

export function locationFixtureWithName(name: string): Location {
  return { name: name, xCoordinate: 0, yCoordinate: 0 };
}
