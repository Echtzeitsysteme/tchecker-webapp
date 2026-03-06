import {AutomatonOptionType} from "./OpenedProcesses.ts";
import {useCallback, useState} from "react";
import {INIT_AUTOMATON} from "../utils/initAutomaton.ts";
import {Integer} from "../model/ta/integer.ts";
import {SyncConstraint} from "../model/ta/syncConstraint.ts";
import {Sync} from "../model/ta/sync.ts";

export interface SystemOptionType {
    label: string;
    processes: AutomatonOptionType[];
    integers: Integer[];
    synchronizations: SyncConstraint[];
}

export interface OpenedSystems {
    systemOptions : SystemOptionType[];
    selectedSystem: SystemOptionType;
    setSelectedSystem: (systemOption: SystemOptionType) => void;
    addSystemOption :(systemOption: SystemOptionType) => void;
    setSystemOptions: (systemOptions: SystemOptionType[]) => void;
    deleteSystemOption :(systemOption: SystemOptionType) => void;
    exchangeSelectedOption :(systemOption: SystemOptionType) => void;
    getLabels: () => string[];
    addInteger: (name: string, size: number, min: number, max: number, init: number) => void;
    editInteger: (name: string, prevName: string, size: number, min: number, max: number, init: number) => void;
    removeInteger: (name: string) => void;
    addSync: (syncConstraints: Sync[]) => void;
    editSync: (syncConstraints: Sync[], prevConstraint: SyncConstraint) => void;
    removeSync: (syncConstraint: SyncConstraint) => void;
}

export function useOpenedSystems(): OpenedSystems {

    const initialOptions : SystemOptionType[] = [{label: 'init_System', processes: [{label:'init_Process', automaton:INIT_AUTOMATON}], integers: [], synchronizations: []}];
    const [selectedSystem, setSelectedSystemInternal] = useState<SystemOptionType>(initialOptions[0]);
    const [systemOptions, setSystemOptionsInternal] = useState<SystemOptionType[]>(initialOptions);

    const setSelectedSystem = useCallback((systemOption: SystemOptionType) => {
            setSelectedSystemInternal(systemOption);
        }, []);

    const addSystemOption = useCallback((systemOption: SystemOptionType) => {
            setSystemOptionsInternal(systemOptions.concat([systemOption]));
            setSelectedSystemInternal(systemOption);
        }, [systemOptions]);

    const setSystemOptions = useCallback((systemOptions: SystemOptionType[]) => {
        setSystemOptionsInternal(systemOptions)
        setSelectedSystemInternal(systemOptions[0]);
        }, []);

    const deleteSystemOption = useCallback((systemOption: SystemOptionType) => {
            const newOptions = systemOptions.filter((option) => option !== systemOption);
            setSystemOptionsInternal(newOptions);
            setSelectedSystemInternal(newOptions[0]);
        }, [systemOptions]);

    const exchangeSelectedOption = useCallback((systemOption: SystemOptionType) => {
        const newSystemOptions = [];
        systemOptions.forEach(val => val === selectedSystem? 
            newSystemOptions.push(systemOption) : 
            newSystemOptions.push(val));
        setSystemOptionsInternal(newSystemOptions);
        setSelectedSystemInternal(systemOption);
      }, [systemOptions, selectedSystem]);

    const getLabels = useCallback(() => {
            return systemOptions.map((option) => option.label);
        }, [systemOptions]);


    // ===== manipulate Integers ===================================================
    const addInteger = useCallback((name: string, size: number, min: number, max: number, init: number) => {
            const integers = selectedSystem.integers;
            const newInteger: Integer = {name: name, size: size, min: min, max: max, init: init};
            const updatedIntegers = [...integers, newInteger];
            const updatedSystem = {...selectedSystem, integers: updatedIntegers};
            setSelectedSystemInternal(updatedSystem);
        }, [selectedSystem]);

    const editInteger = useCallback((name: string, prevName: string, size: number, min: number, max: number, init: number) => {
            const integers = [...selectedSystem.integers];
            const integerToEdit = integers.filter((int) => int.name === prevName)[0];
            integerToEdit.name = name;
            integerToEdit.size = size;
            integerToEdit.min = min;
            integerToEdit.max = max;
            integerToEdit.init = init;
            const updatedSystem = {...selectedSystem, integers: integers};
            setSelectedSystemInternal(updatedSystem);
        }, [selectedSystem]);

    const removeInteger = useCallback((name: string) => {
            const integers = selectedSystem.integers;
            const updatedIntegers = integers.filter((int) => int.name !== name);
            const updatedSystem = {...selectedSystem, integers: updatedIntegers};
            setSelectedSystemInternal(updatedSystem);
        }, [selectedSystem]);

    const addSync = useCallback((syncConstraints: Sync[]) => {
        const synchronizations = [...selectedSystem.synchronizations];
        const newSync: SyncConstraint = {syncs: syncConstraints};
        if (!synchronizations.some((sync) => sync.syncs === newSync.syncs)) {
        const updatedSynchronizations = [...synchronizations, newSync];
        const updatedSystem = {...selectedSystem, synchronizations: updatedSynchronizations};
        setSelectedSystemInternal(updatedSystem);
        }
    }, [selectedSystem]);

    const editSync = useCallback((newSyncs: Sync[], prevConstraint: SyncConstraint) => {
        const synchronizations = [...selectedSystem.synchronizations];
        const synchronizationToEdit = synchronizations.filter((syncs) => syncs === prevConstraint)[0];
        synchronizationToEdit.syncs = newSyncs;
        const updatedSystem = {...selectedSystem, synchronizations: synchronizations};
        setSelectedSystemInternal(updatedSystem);
    }, [selectedSystem]);

    const removeSync = useCallback((syncConstraint: SyncConstraint) => {
        const synchronizations = selectedSystem.synchronizations;
        const updatedSynchronizations = synchronizations.filter((syncs) => syncs !== syncConstraint);
        const updatedSystem = {...selectedSystem, synchronizations: updatedSynchronizations};
        setSelectedSystemInternal(updatedSystem);
    }, [selectedSystem]);

    return {
        systemOptions,
        selectedSystem,
        setSelectedSystem,
        addSystemOption,
        setSystemOptions,
        deleteSystemOption,
        exchangeSelectedOption,
        getLabels,
        addInteger,
        editInteger,
        removeInteger,
        addSync,
        editSync,
        removeSync
    };
}