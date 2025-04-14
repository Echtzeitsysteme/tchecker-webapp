import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClockConstraint } from '../model/ta/clockConstraint';

export interface ClausesViewModel {
  state: ClausesState;
  clauses: ClauseViewData[];
  isValidationError: boolean;
  resetClauses: (viewModel: ClausesViewModel) => void;
  setClausesFromClockConstraint: (viewModel: ClausesViewModel, clockConstraint?: ClockConstraint) => void;
  addClause: (viewModel: ClausesViewModel) => void;
  deleteClause: (viewModel: ClausesViewModel, id: number) => void;
  changeClause: (viewModel: ClausesViewModel, id: number, field: keyof ClauseViewData, value: string) => void;
}

export enum ClausesState {
  INIT = 'INIT',
  READY = 'READY',
}

export interface ClauseViewData {
  id: number;
  clockValue: string;
  comparisonValue: string;
  numberInput: string; // string so that input field can be empty
  isClockInvalid: boolean;
  isComparisonInvalid: boolean;
  isNumberInvalid: boolean;
}

export function useClausesViewModel(): ClausesViewModel {
  const emptyClause: ClauseViewData = useMemo(
    () => ({
      id: Date.now(),
      clockValue: '',
      comparisonValue: '',
      numberInput: '0',
      isClockInvalid: true,
      isComparisonInvalid: true,
      isNumberInvalid: false,
    }),
    []
  );

  const resetClauses = useCallback(
    (viewModel: ClausesViewModel) => {
      setViewModel({ ...viewModel, clauses: [emptyClause] });
    },
    [emptyClause]
  );

  const setClausesFromClockConstraint = useCallback(
    (viewModel: ClausesViewModel, clockConstraint?: ClockConstraint) => {
      if (!clockConstraint) {
        setViewModel({ ...viewModel, clauses: [emptyClause] });
        return;
      }
      // don't just call Date.now() for every clause because generation is too fast
      let idCounter: number = Date.now();
      const clauseData = clockConstraint.clauses.map<ClauseViewData>((c) => {
        const clauseData: ClauseViewData = {
          id: idCounter++,
          clockValue: c.lhs.name,
          comparisonValue: c.op,
          numberInput: '' + c.rhs,
          isClockInvalid: false,
          isComparisonInvalid: false,
          isNumberInvalid: false,
        };
        return clauseData;
      });
      setViewModel({ ...viewModel, clauses: clauseData });
    },
    [emptyClause]
  );

  const addClause = useCallback(
    (viewModel: ClausesViewModel) => {
      const updatedClauses = [...viewModel.clauses, { ...emptyClause, id: Date.now() }];
      setViewModel({ ...viewModel, clauses: updatedClauses });
    },
    [emptyClause]
  );

  const deleteClause = useCallback((viewModel: ClausesViewModel, id: number) => {
    if (viewModel.clauses.length <= 0) {
      return;
    }
    const updatedClauses = viewModel.clauses.filter((row) => row.id !== id);
    setViewModel({ ...viewModel, clauses: updatedClauses });
  }, []);

  const changeClause = useCallback(
    (viewModel: ClausesViewModel, id: number, field: keyof ClauseViewData, value: string) => {
      const updatedClauses = viewModel.clauses.map((row) => {
        if (row.id === id) {
          let updatedRow = { ...row, [field]: value };
          // Update validation flags based on the new value
          if (field === 'clockValue') {
            updatedRow.isClockInvalid = !value;
          }
          if (field === 'comparisonValue') {
            updatedRow.isComparisonInvalid = !value;
          }
          if (field === 'numberInput') {
            updatedRow.isNumberInvalid = !value;
          }
          // Update for number value if it changed
          if (field === 'numberInput' && value) {
            updatedRow = { ...updatedRow, [field]: '' + Math.max(0, parseInt(value, 10)) };
          }
          return updatedRow;
        }
        return row;
      });
      setViewModel({ ...viewModel, clauses: updatedClauses });
    },
    []
  );

  const [viewModel, setViewModel] = useState<ClausesViewModel>({
    state: ClausesState.INIT,
    clauses: [],
    isValidationError: true,
    resetClauses: resetClauses,
    setClausesFromClockConstraint: setClausesFromClockConstraint,
    addClause: addClause,
    deleteClause: deleteClause,
    changeClause: changeClause,
  });

  // ===================================================================================================================

  useEffect(() => {
    if (viewModel.state === ClausesState.INIT) {
      // nothing to initialize at the moment. just set state to READY
      setViewModel({ ...viewModel, state: ClausesState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    // update clause validation when clauses change
    const someClausesInvalid = viewModel.clauses
      .map((c) => c.isClockInvalid || c.isComparisonInvalid || c.isNumberInvalid)
      .reduce((result, current) => result || current, false);
    setViewModel((viewModel) => ({ ...viewModel, isValidationError: someClausesInvalid }));
  }, [viewModel.clauses]);

  // ===================================================================================================================

  return viewModel;
}
