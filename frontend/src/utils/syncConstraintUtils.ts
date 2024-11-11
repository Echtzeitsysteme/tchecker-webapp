import {SyncViewData} from "../viewmodel/SyncConstraintViewModel.ts";
import {SyncConstraint} from "../model/ta/syncConstraint.ts";
import {useCallback} from "react";
import {Sync} from "../model/ta/sync.ts";

export interface SyncConstraintUtils{
    transformToSyncConstraint: (syncData: SyncViewData[]) => SyncConstraint | undefined;
}

export function useSyncConstraintUtils(): SyncConstraintUtils{
    const transformToSyncConstraint = useCallback(
        (syncData: SyncViewData[]) => {
            if(!syncData || syncData.length === 0){
                return undefined;
            }
            const syncConstr: SyncConstraint = {syncs: []};
            syncData.forEach((sync) => {
                const newSync: Sync = {process: sync.processValue, event: sync.actionValue, weakSynchronisation: sync.weakSync}
                syncConstr.syncs.push(newSync);
            });
            return syncConstr;
        }, []
    );

    return{
        transformToSyncConstraint: transformToSyncConstraint,
    }
}