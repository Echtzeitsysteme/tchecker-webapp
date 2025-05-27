import { useCallback, useEffect, useMemo, useState } from 'react';
import { SyncConstraint } from '../model/ta/syncConstraint.ts';

export interface SyncViewModel {
  state: SyncState;
  syncs: SyncViewData[];
  isValidationError: boolean;
  resetSyncs: (viewModel: SyncViewModel) => void;
  setSyncsFromSyncConstraint: (viewModel: SyncViewModel, syncConstraint?: SyncConstraint) => void;
  addSync: (viewModel: SyncViewModel) => void;
  deleteSync: (viewModel: SyncViewModel, id: number) => void;
  changeSync: (viewModel: SyncViewModel, id: number, field: keyof SyncViewData, value: string) => void;
  changeWeakOrNot: (viewModel: SyncViewModel, id: number, value: boolean) => void;
}

export enum SyncState {
  INIT = 'INIT',
  READY = 'READY',
}

export interface SyncViewData {
  id: number;
  processValue: string;
  weakSync: boolean | undefined;
  actionValue: string;
  isProcessInvalid: boolean;
  isActionInvalid: boolean;
}

export function useSyncConstraintViewModel(): SyncViewModel {
  const emptySync: SyncViewData = useMemo(
    () => ({
      id: Date.now(),
      processValue: '',
      actionValue: '',
      weakSync: false,
      isProcessInvalid: true,
      isActionInvalid: true,
    }),
    []
  );

  const resetSyncs = useCallback(
    (viewModel: SyncViewModel) => {
      setViewModel({ ...viewModel, syncs: [emptySync] });
    },
    [emptySync]
  );

  const setSyncsFromSyncConstraint = useCallback(
    (viewModel: SyncViewModel, syncConstraint?: SyncConstraint) => {
      if (!syncConstraint) {
        setViewModel({ ...viewModel, syncs: [emptySync] });
        return;
      }
      // don't just call Date.now() for every clause because generation is too fast
      let idCounter: number = Date.now();
      const syncData = syncConstraint.syncs.map<SyncViewData>((sync) => {
        const syncData: SyncViewData = {
          id: idCounter++,
          processValue: sync.process,
          actionValue: sync.event,
          weakSync: sync.weakSynchronisation,
          isProcessInvalid: false,
          isActionInvalid: false,
        };
        return syncData;
      });
      setViewModel({ ...viewModel, syncs: syncData });
    },
    [emptySync]
  );

  const addSync = useCallback(
    (viewModel: SyncViewModel) => {
      const updatedSyncs = [...viewModel.syncs, { ...emptySync, id: Date.now() }];
      setViewModel({ ...viewModel, syncs: updatedSyncs });
    },
    [emptySync]
  );

  const deleteSync = useCallback((viewModel: SyncViewModel, id: number) => {
    if (viewModel.syncs.length <= 0) {
      return;
    }
    const updatedSyncs = viewModel.syncs.filter((row) => row.id !== id);
    setViewModel({ ...viewModel, syncs: updatedSyncs });
  }, []);

  const changeSync = useCallback((viewModel: SyncViewModel, id: number, field: keyof SyncViewData, value: string) => {
    const updatedSyncs = viewModel.syncs.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        // Update validation flags based on the new value
        if (field === 'processValue') {
          updatedRow.isProcessInvalid = !value;
        }
        if (field === 'actionValue') {
          updatedRow.isActionInvalid = !value;
        }
        return updatedRow;
      }
      return row;
    });
    setViewModel({ ...viewModel, syncs: updatedSyncs });
  }, []);

  const changeWeakOrNot = useCallback((viewModel: SyncViewModel, id: number, value: boolean) => {
    const updatedSyncs = viewModel.syncs.map((row) => {
      if (row.id === id) {
        const updatedRow: SyncViewData = { ...row, weakSync: value };
        return updatedRow;
      }
      return row;
    });
    setViewModel({ ...viewModel, syncs: updatedSyncs });
  }, []);

  const [viewModel, setViewModel] = useState<SyncViewModel>({
    state: SyncState.INIT,
    syncs: [],
    isValidationError: true,
    resetSyncs: resetSyncs,
    setSyncsFromSyncConstraint: setSyncsFromSyncConstraint,
    addSync: addSync,
    deleteSync: deleteSync,
    changeSync: changeSync,
    changeWeakOrNot: changeWeakOrNot,
  });

  // ===================================================================================================================

  useEffect(() => {
    if (viewModel.state === SyncState.INIT) {
      // nothing to initialize at the moment. just set state to READY
      setViewModel({ ...viewModel, state: SyncState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    // update clause validation when clauses change
    const someSyncsInvalid = viewModel.syncs
      .map((c) => c.isProcessInvalid || c.isActionInvalid)
      .reduce((result, current) => result || current, false);
    setViewModel((viewModel) => ({ ...viewModel, isValidationError: someSyncsInvalid }));
  }, [viewModel.syncs]);

  // ===================================================================================================================

  return viewModel;
}
