import React, { useCallback, useState } from 'react';
import { INIT_AUTOMATON } from '../utils/initAutomaton.ts';
import {TimedAutomaton} from "../model/ta/timedAutomaton.ts";

export interface AutomatonOptionType {
  label: string;
  automaton: TimedAutomaton;
}

export interface OpenedProcesses {
  automatonOptions: AutomatonOptionType[];
  selectedOption: AutomatonOptionType;
  addAutomatonOption: (openedProcesses: OpenedProcesses, automatonOption: AutomatonOptionType) => void;
  setAutomatonOptions: (openedProcesses: OpenedProcesses, automatonOptions: AutomatonOptionType[]) => void;
  deleteAutomatonOption: (openedProcesses: OpenedProcesses, automatonOption: AutomatonOptionType) => void;
  setSelectedAutomaton: (automatonOption: AutomatonOptionType) => void;
  getLabels: (automatonOptions: AutomatonOptionType[]) => string[];
}

export function useOpenedProcesses(): OpenedProcesses {
  const addAutomatonOption = useCallback((openedProcesses: OpenedProcesses, automatonOption: AutomatonOptionType) => {
    const automatonOptions = openedProcesses.automatonOptions;
    automatonOptions.push(automatonOption);
    setOpenedProcesses({ ...openedProcesses, openedProcesses: openedProcesses, automatonOptions: automatonOptions, selectedOption: automatonOption });
  }, []);

  const setAutomatonOptions = useCallback(
    (openedProcesses: OpenedProcesses, automatonOptions: AutomatonOptionType[]) => {
      openedProcesses.selectedOption = automatonOptions[0];
      setOpenedProcesses({ ...openedProcesses, openedProcesses: openedProcesses, automatonOptions: automatonOptions });
    },
    []
  );

  const deleteAutomatonOption = useCallback(
    (openedProcesses: OpenedProcesses, automatonOption: AutomatonOptionType) => {
      const options = openedProcesses.automatonOptions;
      const newOptions = options.filter((option) => option !== automatonOption);
      console.log('newoptions', newOptions);
      openedProcesses.selectedOption = newOptions[0]; //<- sollte eig unnötig sein...
      openedProcesses.automatonOptions = newOptions; //<- sollte eig unnötig sein...
      setOpenedProcesses({ ...openedProcesses, openedProcesses: openedProcesses, automatonOptions: newOptions });
      //openedProcesses.setAutomatonOptions(openedProcesses, newOptions);
    },
    []
  );

  const setSelectedAutomaton = useCallback((automatonOption: AutomatonOptionType) => {
    setSelectedOption(automatonOption);
  }, []);

  const getLabels = useCallback((automatonOptions: AutomatonOptionType[]) => {
    const labels = automatonOptions.map((option) => option.label);
    return labels;
  }, []);

  const initialOption: AutomatonOptionType[] = [{ label: 'init_Process', automaton: INIT_AUTOMATON }];
  const [selectedOption, setSelectedOption] = React.useState<AutomatonOptionType>(initialOption[0]);

  const [openedProcesses, setOpenedProcesses] = useState<OpenedProcesses>({
    automatonOptions: initialOption,
    selectedOption: selectedOption,
    addAutomatonOption: addAutomatonOption,
    setAutomatonOptions: setAutomatonOptions,
    deleteAutomatonOption: deleteAutomatonOption,
    setSelectedAutomaton: setSelectedAutomaton,
    getLabels: getLabels,
  });

  /**
     useEffect(() => {
     setOpenedProcesses({...openedProcesses});
     }, [openedProcesses]);
     **/

  return openedProcesses;
}
