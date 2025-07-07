export type ErrorResult<T> = [T | null, Error | null];


export function tryCatch<T>(fn: () => T): ErrorResult<T> {
  try {
    const result = fn();
    return [result, null];
  } catch (error) {
    if (error instanceof Error) {
      return [null, error];
    } else {
      return [null, new Error('An unknown error occurred')];
    }
  }
}

export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<ErrorResult<T>> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    if (error instanceof Error) {
      return [null, error];
    } else {
      return [null, new Error('An unknown error occurred')];
    }
  }
}
