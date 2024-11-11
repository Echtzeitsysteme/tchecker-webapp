import {ClockConstraint} from "../model/ta/clockConstraint.ts";
import {useCallback, useEffect, useMemo, useState} from "react";

export interface FreeClausesViewModel {
    state: ClausesState;
    freeClauses: FreeClauseViewData[];
    resetFreeClauses: (viewModel: FreeClausesViewModel) => void;
    setFreeClausesFromClockConstraint: (viewModel: FreeClausesViewModel, clockConstraint?: ClockConstraint) => void;
    addFreeClause: (viewModel: FreeClausesViewModel) => void;
    deleteFreeClause: (viewModel: FreeClausesViewModel, id: number) => void;
    changeFreeClause: (viewModel: FreeClausesViewModel, id: number, field: keyof FreeClauseViewData, value: string) => void;
}

export enum ClausesState {
    INIT = 'INIT',
    READY = 'READY',
}

export interface FreeClauseViewData{
    id: number;
    term: string;
}

export function useFreeClausesViewModel(): FreeClausesViewModel {
    const emptyFreeClause: FreeClauseViewData = useMemo(
        () => ({
            id: Date.now(),
            term:'',
        }),
        []
    );

    const resetFreeClauses = useCallback(
        (viewModel: FreeClausesViewModel) => {
            setViewModel({ ...viewModel, freeClauses: [emptyFreeClause] });
        },
        [emptyFreeClause]
    );

    const setFreeClausesFromClockConstraint = useCallback(
        (viewModel: FreeClausesViewModel, clockConstraint?: ClockConstraint) => {
            if (!clockConstraint) {
                setViewModel({ ...viewModel, freeClauses: [emptyFreeClause] });
                return;
            }
            // don't just call Date.now() for every clause because generation is too fast
            let idCounter: number = Date.now();
            const clauseData = clockConstraint.freeClauses.map<FreeClauseViewData>((c) => {
                const clauseData: FreeClauseViewData = {
                    id: idCounter++,
                    term: c.term
                };
                return clauseData;
            });
            setViewModel({ ...viewModel, freeClauses: clauseData });
        },
        [emptyFreeClause]
    );

    const addFreeClause = useCallback(
        (viewModel: FreeClausesViewModel) => {
            const updatedClauses = [...viewModel.freeClauses, { ...emptyFreeClause, id: Date.now() }];
            setViewModel({ ...viewModel, freeClauses: updatedClauses });
        },
        [emptyFreeClause]
    );

    const deleteFreeClause = useCallback((viewModel: FreeClausesViewModel, id: number) => {
        if (viewModel.freeClauses.length <= 0) {
            return;
        }
        const updatedFreeClauses = viewModel.freeClauses.filter((row) => row.id !== id);
        setViewModel({ ...viewModel, freeClauses: updatedFreeClauses });
    }, []);

    const changeFreeClause = useCallback(
        (viewModel: FreeClausesViewModel, id: number, field: keyof FreeClauseViewData, value: string) => {
            const updatedClauses = viewModel.freeClauses.map((row) => {
                if (row.id === id) {
                    const updatedRow = { ...row, [field]: value };
                    // Update validation flags based on the new value
                    if (field === 'freeInput') {
                        updatedRow.term = value;
                    }
                    return updatedRow;
                }
                return row;
            });
            setViewModel({ ...viewModel, freeClauses: updatedClauses });
        },
        []
    );

    const [viewModel, setViewModel] = useState<FreeClausesViewModel>({
        state: ClausesState.INIT,
        freeClauses: [],
        resetFreeClauses: resetFreeClauses,
        setFreeClausesFromClockConstraint: setFreeClausesFromClockConstraint,
        addFreeClause: addFreeClause,
        deleteFreeClause: deleteFreeClause,
        changeFreeClause: changeFreeClause,
    });

    // ===================================================================================================================

    useEffect(() => {
        if (viewModel.state === ClausesState.INIT) {
            // nothing to initialize at the moment. just set state to READY
            setViewModel({ ...viewModel, state: ClausesState.READY });
        }
    }, [viewModel]);

    // ===================================================================================================================

    return viewModel;
}
