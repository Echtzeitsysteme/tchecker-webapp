import {AutomatonOptionType} from "./OpenedProcesses.ts";
import React, {useCallback, useState} from "react";
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
    addSystemOption :(openedSystems: OpenedSystems, systemOption: SystemOptionType) => void;
    deleteSystemOption :(openedSystems: OpenedSystems, systemOption: SystemOptionType) => void;
    getLabels: (systemOptions: SystemOptionType[]) => string[];
    addInteger: (openedSystems: OpenedSystems, name: string, size: number, min: number, max: number, init: number) => void;
    editInteger: (openedSystems: OpenedSystems, name: string, prevName: string, size: number, min: number, max: number, init: number) => void;
    removeInteger: (openedSystems: OpenedSystems, name: string) => void;
    addSync: (openedSystems: OpenedSystems, syncConstraints: Sync[]) => void;
    editSync: (openedSystems: OpenedSystems, syncConstraints: Sync[], prevConstraint: SyncConstraint) => void;
    removeSync: (openedSystems: OpenedSystems, syncConstraint: SyncConstraint) => void;
}

export function useOpenedSystems(): OpenedSystems {

    const setSelectedSystem = useCallback(
        (systemOption: SystemOptionType) => {
            setSelectedOption(systemOption);
        },
        []
    );

    const addSystemOption = useCallback(
        (openedSystems: OpenedSystems, systemOption: SystemOptionType) => {
            const systemOptions = openedSystems.systemOptions;
            systemOptions.push(systemOption);
            setOpenedSystems({...openedSystems, openedSystems: openedSystems, systemOptions: systemOptions, selectedSystem: systemOption});
        },
        []
    );

    const deleteSystemOption = useCallback(
        (openedSystems: OpenedSystems, systemOption: SystemOptionType) => {
            const options = openedSystems.systemOptions;
            const newOptions = options.filter((option) => option !== systemOption);
            openedSystems.selectedSystem = newOptions[0];
            //oder so eine setSystemOptions Methode kreieren und dann hier openedSystems.setSystemsOptions(openedSystems, newOptions); ???
            setOpenedSystems({...openedSystems, openedSystems: openedSystems, systemOptions: newOptions});
        },
        []
    );

    const getLabels = useCallback(
        (systemOptions : SystemOptionType[]) => {
            const labels = systemOptions.map((option) => option.label);
            return labels;
        },
        []
    );


    // ===== manipulate Integers ===================================================
    const addInteger = useCallback((openedSystems: OpenedSystems, name: string, size: number, min: number, max: number, init: number) => {
        const system = openedSystems.selectedSystem;
        const integers = system.integers;
        const newInteger: Integer = {name: name, size: size, min: min, max: max, init: init};
        const updatedIntegers = [...integers, newInteger];
        const updatedSystem = {...system, integers: updatedIntegers};
        setOpenedSystems({...openedSystems, selectedSystem: updatedSystem});
        },
        []
    );

    const editInteger = useCallback((openedSystems: OpenedSystems, name: string, prevName: string, size: number, min: number, max: number, init: number) => {
        const system = openedSystems.selectedSystem;
        const integers = [...system.integers];
        const integerToEdit = integers.filter((int) => int.name === prevName)[0];
        integerToEdit.name = name;
        integerToEdit.size = size;
        integerToEdit.min = min;
        integerToEdit.max = max;
        integerToEdit.init = init;
        const updatedSystem = {...system, integers: integers};
        setOpenedSystems({...openedSystems, selectedSystem: updatedSystem});
        },
        []
    );

    const removeInteger = useCallback((openedSystems: OpenedSystems, name: string) => {
        const system = openedSystems.selectedSystem;
        const integers = system.integers;
        const updatedIntegers = integers.filter((int) => int.name !== name);
        const updatedSystem = {...system, integers: updatedIntegers};
        setOpenedSystems({...openedSystems, selectedSystem: updatedSystem});
        },
        []
    );

    const addSync = useCallback((openedSystems: OpenedSystems, syncConstraints: Sync[]) => {
        const system = openedSystems.selectedSystem;
        const synchronizations = [...system.synchronizations];
        const newSync: SyncConstraint = {syncs: syncConstraints};
        if (!synchronizations.some((sync) => sync.syncs === newSync.syncs)) {
        const updatedSynchronizations = [...synchronizations, newSync];
        const updatedSystem = {...system, synchronizations: updatedSynchronizations};
        setOpenedSystems({...openedSystems, selectedSystem: updatedSystem});
        }
    }, []);

    const editSync = useCallback((openedSystems: OpenedSystems, newSyncs: Sync[], prevConstraint: SyncConstraint) => {
        const system = openedSystems.selectedSystem;
        const synchronizations = [...system.synchronizations];
        const synchronizationToEdit = synchronizations.filter((syncs) => syncs === prevConstraint)[0];
        synchronizationToEdit.syncs = newSyncs;
        const updatedSystem = {...system, synchronizations: synchronizations};
        setOpenedSystems({...openedSystems, selectedSystem: updatedSystem});
    }, []);

    const removeSync = useCallback((openedSystems: OpenedSystems, syncConstraint: SyncConstraint) => {
        const system = openedSystems.selectedSystem;
        const synchronizations = system.synchronizations;
        const updatedSynchronizations = synchronizations.filter((syncs) => syncs !== syncConstraint);
        const updatedSystem = {...system, synchronizations: updatedSynchronizations};
        setOpenedSystems({...openedSystems, selectedSystem: updatedSystem});
    }, []);

    const initialOption : SystemOptionType[] =
        [
            {label: 'init_System', processes: [{label:'init_Process' , automaton:INIT_AUTOMATON }], integers: [], synchronizations: []}
        ];
    const [selectedOption, setSelectedOption] = React.useState<SystemOptionType>(initialOption[0]);

    const [openedSystems, setOpenedSystems] = useState<OpenedSystems>({
        systemOptions: initialOption,
        selectedSystem: selectedOption,
        setSelectedSystem: setSelectedSystem,
        addSystemOption: addSystemOption,
        deleteSystemOption: deleteSystemOption,
        getLabels: getLabels,
        addInteger: addInteger,
        editInteger: editInteger,
        removeInteger: removeInteger,
        addSync: addSync,
        editSync: editSync,
        removeSync: removeSync,
    });

    return openedSystems;
}