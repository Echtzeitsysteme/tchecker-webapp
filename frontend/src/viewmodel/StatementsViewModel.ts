import {useCallback, useEffect, useMemo, useState} from "react";
import {SwitchStatement} from "../model/ta/switchStatement.ts";

export interface StatementsViewModel {
    state: StatementsState;
    statements: StatementViewData[];
    resetStatements: (viewModel: StatementsViewModel) => void;
    setStatement: (viewModel: StatementsViewModel, statement: SwitchStatement) => void;
    addStatement: (viewModel: StatementsViewModel) => void;
    deleteStatement: (viewModel: StatementsViewModel, id: number) => void;
    changeStatement: (viewModel: StatementsViewModel, id: number, field: string, value: string) => void;
}

export enum StatementsState {
    INIT = 'INIT',
    READY = 'READY',
}

export interface StatementViewData{
    id: number;
    term: string;
}

export function useStatementsViewModel(): StatementsViewModel {
    const emptyStatement: StatementViewData = useMemo(
        () => ({
            id: Date.now(),
            term:'',
        }),
        []
    );

    const resetStatements = useCallback(
        (viewModel: StatementsViewModel) => {
            setViewModel({ ...viewModel, statements: [emptyStatement] });
        },
        [emptyStatement]
    );

    const setStatement = useCallback(
        (viewModel: StatementsViewModel, statement?: SwitchStatement) => {
            if (!statement) {
                setViewModel({ ...viewModel, statements: [emptyStatement] });
                return;
            }
            // don't just call Date.now() for every clause because generation is too fast
            let idCounter: number = Date.now();
            const statementData = statement.statements.map<StatementViewData>((c) => {
                const statementData: StatementViewData = {
                    id: idCounter++,
                    term: c.term
                };
                return statementData;
            });
            setViewModel({ ...viewModel, statements: statementData });
        },
        [emptyStatement]
    );

    const addStatement = useCallback(
        (viewModel: StatementsViewModel) => {
            const updatedStatements = [...viewModel.statements, { ...emptyStatement, id: Date.now() }];
            setViewModel({ ...viewModel, statements: updatedStatements });
        },
        [emptyStatement]
    );

    const deleteStatement = useCallback((viewModel: StatementsViewModel, id: number) => {
        if (viewModel.statements.length <= 0) {
            return;
        }
        const updatedStatements = viewModel.statements.filter((row) => row.id !== id);
        setViewModel({ ...viewModel, statements: updatedStatements });
    }, []);

    const changeStatement = useCallback(
        (viewModel: StatementsViewModel, id: number, field: keyof StatementViewData, value: string) => {
            const updatedStatements = viewModel.statements.map((row) => {
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
            setViewModel({ ...viewModel, statements: updatedStatements });
        },
        []
    );

    const [viewModel, setViewModel] = useState<StatementsViewModel>({
        state: StatementsState.INIT,
        statements: [],
        resetStatements: resetStatements,
        setStatement: setStatement,
        addStatement: addStatement,
        deleteStatement: deleteStatement,
        changeStatement: changeStatement,
    });

    // ===================================================================================================================

    useEffect(() => {
        if (viewModel.state === StatementsState.INIT) {
            // nothing to initialize at the moment. just set state to READY
            setViewModel({ ...viewModel, state: StatementsState.READY });
        }
    }, [viewModel]);

    // ===================================================================================================================

    return viewModel;
}
