import {useCallback, useEffect, useMemo, useState} from "react";

export interface LabelsViewModel {
    state: LabelsState;
    labels: LabelsViewData[];
    resetLabels: (viewModel: LabelsViewModel) => void;
    setLabels: (viewModel: LabelsViewModel, label: string[]) => void;
    addLabel: (viewModel: LabelsViewModel) => void;
    deleteLabel: (viewModel: LabelsViewModel, id: number) => void;
    changeLabel: (viewModel: LabelsViewModel, id: number, field: string, value: string) => void;
}

export enum LabelsState {
    INIT = 'INIT',
    READY = 'READY',
}

export interface LabelsViewData{
    id: number;
    term: string;
}

export function useLabelsViewModel(): LabelsViewModel {
    const emptyLabel: LabelsViewData = useMemo(
        () => ({
            id: Date.now(),
            term:'',
        }),
        []
    );

    const resetLabels = useCallback(
        (viewModel: LabelsViewModel) => {
            setViewModel({ ...viewModel, labels: [emptyLabel] });
        },
        [emptyLabel]
    );

    const setLabels = useCallback(
        (viewModel: LabelsViewModel, labels?: string[]) => {
            if (!labels) {
                setViewModel({ ...viewModel, labels: [emptyLabel] });
                return;
            }
            // don't just call Date.now() for every clause because generation is too fast
            let idCounter: number = Date.now();
            const labelData = labels.map<LabelsViewData>((c) => {
                const labelData: LabelsViewData = {
                    id: idCounter++,
                    term: c
                };
                return labelData;
            });
            setViewModel({ ...viewModel, labels: labelData });
        },
        [emptyLabel]
    );

    const addLabel = useCallback(
        (viewModel: LabelsViewModel) => {
            const updatedLabels = [...viewModel.labels, { ...emptyLabel, id: Date.now() }];
            setViewModel({ ...viewModel, labels: updatedLabels });
        },
        [emptyLabel]
    );

    const deleteLabel = useCallback((viewModel: LabelsViewModel, id: number) => {
        if (viewModel.labels.length <= 0) {
            return;
        }
        const updatedLabels = viewModel.labels.filter((row) => row.id !== id);
        setViewModel({ ...viewModel, labels: updatedLabels });
    }, []);

    const changeLabel = useCallback(
        (viewModel: LabelsViewModel, id: number, field: keyof LabelsViewData, value: string) => {
            const updatedLabels = viewModel.labels.map((row) => {
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
            setViewModel({ ...viewModel, labels: updatedLabels });
        },
        []
    );

    const [viewModel, setViewModel] = useState<LabelsViewModel>({
        state: LabelsState.INIT,
        labels: [],
        resetLabels: resetLabels,
        setLabels: setLabels,
        addLabel: addLabel,
        deleteLabel: deleteLabel,
        changeLabel: changeLabel,
    });

    // ===================================================================================================================

    useEffect(() => {
        if (viewModel.state === LabelsState.INIT) {
            // nothing to initialize at the moment. just set state to READY
            setViewModel({ ...viewModel, state: LabelsState.READY });
        }
    }, [viewModel]);

    // ===================================================================================================================

    return viewModel;
}
