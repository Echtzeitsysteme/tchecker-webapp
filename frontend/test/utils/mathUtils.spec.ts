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
    const number0 = 2;
    const number1 = 3;
    const number2 = 5;
    const number3 = 7;
    const expectedAvg = (number0 + number1 + number2 + number3) / 4;
    const expectedRoundedAvg = Math.round(expectedAvg);

    // when
    const avg = avgRounded([number0, number1, number2, number3]);

    // then
    expect(avg).toBe(expectedRoundedAvg);
  });

  test('avgRounded returns input when input array consists of only one number', () => {
    // given
    const number = 42;

    // when
    const avg = avgRounded([number]);

    // then
    expect(avg).toBe(number);
  });
});
