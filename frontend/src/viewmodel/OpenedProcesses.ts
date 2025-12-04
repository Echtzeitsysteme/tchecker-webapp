import { useCallback, useState } from 'react';
import { INIT_AUTOMATON } from '../utils/initAutomaton.ts';
import {TimedAutomaton} from "../model/ta/timedAutomaton.ts";

export interface AutomatonOptionType {
  label: string;
  automaton: TimedAutomaton;
}

export interface OpenedProcesses {
  automatonOptions: AutomatonOptionType[];
  selectedOption: AutomatonOptionType;
  addAutomatonOption: (automatonOption: AutomatonOptionType) => void;
  setAutomatonOptions: (automatonOptions: AutomatonOptionType[]) => void;
  deleteAutomatonOption: (automatonOption: AutomatonOptionType) => void;
  setSelectedAutomaton: (automatonOption: AutomatonOptionType) => void;
  exchangeSelectedAutomaton: (automatonOption: AutomatonOptionType) => void;
  getLabels: () => string[];
}

export function useOpenedProcesses(): OpenedProcesses {

  const initialOptions: AutomatonOptionType[] = [{ label: 'init_Process', automaton: INIT_AUTOMATON }];
  const [automatonOptions, setAutomatonOptionsInternal] = useState<AutomatonOptionType[]>(initialOptions);
  const [selectedOption, setSelectedOption] = useState<AutomatonOptionType>(initialOptions[0]);

  const addAutomatonOption = useCallback((automatonOption: AutomatonOptionType) => {
    setAutomatonOptionsInternal(automatonOptions.concat(automatonOption));
    setSelectedOption(automatonOption);
  }, [automatonOptions]);

  const setAutomatonOptions = useCallback((automatonOptions: AutomatonOptionType[]) => {
      setAutomatonOptionsInternal(automatonOptions)
      setSelectedOption(automatonOptions[0]);
    }, []);

  const deleteAutomatonOption = useCallback((automatonOption: AutomatonOptionType) => {
      const newOptions = automatonOptions.filter((option) => option !== automatonOption);

      setAutomatonOptionsInternal(newOptions);
      setSelectedOption(newOptions[0]);
    }, [automatonOptions]);


  const setSelectedAutomaton = useCallback((automatonOption: AutomatonOptionType) => {
    setSelectedOption(automatonOption);
  }, []);

  const exchangeSelectedAutomaton = useCallback((automatonOption: AutomatonOptionType) => {
    const newAutomatonOptions = [];
    automatonOptions.forEach(val => val === selectedOption? 
      newAutomatonOptions.push(automatonOption) : 
      newAutomatonOptions.push(val));
    
    setAutomatonOptionsInternal(newAutomatonOptions);
    setSelectedAutomaton(automatonOption);
  }, [automatonOptions, selectedOption]);


  const getLabels = useCallback(() => {
    return automatonOptions.map((option) => option.label);
  }, [automatonOptions]);

  return {
    automatonOptions,
    selectedOption,
    addAutomatonOption,
    setAutomatonOptions,
    deleteAutomatonOption,
    setSelectedAutomaton,
    exchangeSelectedAutomaton,
    getLabels
  };
}
