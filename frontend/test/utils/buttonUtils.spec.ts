import { renderHook } from '@testing-library/react';
import { useButtonUtils } from '../../src/utils/buttonUtils';

describe('buttonUtils', () => {
  // define and import all util functions once before starting as import is more complicated due to the use of hooks
  let executeOnKeyboardClick: (keyPressed: string, functionToExecute: () => void) => void;

  beforeAll(() => {
    const { result } = renderHook(() => useButtonUtils());
    executeOnKeyboardClick = result.current.executeOnKeyboardClick;
  });

  test('executeOnKeyboardClick executes functionToExecute when Enter key is pressed', () => {
    // given
    const functionToExecute = jest.fn();
    const keyPressed = 'Enter';

    // when
    executeOnKeyboardClick(keyPressed, functionToExecute);

    // then
    expect(functionToExecute).toHaveBeenCalledTimes(1);
  });

  test('executeOnKeyboardClick executes functionToExecute when Space key is pressed', () => {
    // given
    const functionToExecute = jest.fn();
    const keyPressed = ' ';

    // when
    executeOnKeyboardClick(keyPressed, functionToExecute);

    // then
    expect(functionToExecute).toHaveBeenCalledTimes(1);
  });

  test.each(['Tab', 'Shift', 'Alt', 'Control', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'a'])(
    'executeOnKeyboardClick does not execute functionToExecute when %s is pressed',
    (keyPressed) => {
      // given
      const functionToExecute = jest.fn();

      // when
      executeOnKeyboardClick(keyPressed, functionToExecute);

      // then
      expect(functionToExecute).not.toHaveBeenCalled();
    }
  );
});
