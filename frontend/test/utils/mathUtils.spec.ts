import { renderHook } from '@testing-library/react';
import { useMathUtils } from '../../src/utils/mathUtils';

describe('mathUtils', () => {
  // define and import all util functions once before starting as import is more complicated due to the use of hooks
  let avgRounded: (numbers: number[]) => number;

  beforeAll(() => {
    const { result } = renderHook(() => useMathUtils());
    avgRounded = result.current.avgRounded;
  });

  test('avgRounded returns 0 when input array is empty', () => {
    // when
    const avg = avgRounded([]);

    // then
    expect(avg).toBe(0);
  });

  test('avgRounded returns rounded average of numbers', () => {
    // given
    const numbers = [2, 3, 5, 7, 11];

    // when
    const avg = avgRounded(numbers);

    // then
    expect(avg).toBe(6);
  });

  test('avgRounded returns input when input array consists of only one number', () => {
    // given
    const numbers = [42];

    // when
    const avg = avgRounded(numbers);

    // then
    expect(avg).toBe(42);
  });
});
