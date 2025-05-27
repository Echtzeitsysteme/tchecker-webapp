import { useCallback } from 'react';

const ENTER_KEY = 'Enter';
const SPACE_KEY = ' ';

interface ButtonUtils {
  executeOnKeyboardClick: (keyPressed: string, functionToExecute: () => void) => void;
}

export function useButtonUtils(): ButtonUtils {
  const executeOnKeyboardClick = useCallback((keyPressed: string, functionToExecute: () => void) => {
    if (keyPressed === ENTER_KEY || keyPressed === SPACE_KEY) {
      functionToExecute();
    }
  }, []);
  return { executeOnKeyboardClick: executeOnKeyboardClick };
}
