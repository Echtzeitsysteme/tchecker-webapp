import { useCallback } from 'react';

export interface MathUtils {
  avgRounded: (numbers: number[]) => number;
}

export function useMathUtils(): MathUtils {
  const avgRounded = useCallback((numbers: number[]): number => {
    if (!numbers || numbers.length === 0) {
      return 0;
    }
    const avg = numbers.reduce((a, b) => a + b) / numbers.length;
    return Math.round(avg);
  }, []);

  return { avgRounded: avgRounded };
}
