import { useState } from 'react';
import { SystemOptionType } from './OpenedSystems';
import { TCheckerUtils } from '../utils/tcheckerUtils';

export class RawSimulationState {
  public intval: string;
  public labels: string;
  public vloc: string;
  public zone: string;

  public fromJson(json: RawSimulationState): RawSimulationState {
    this.intval = json.intval;
    this.labels = json.labels;
    this.vloc = json.vloc;
    this.zone = json.zone;
    return this;
  }

  public parse(): SimulationState {
    const integerValues: IntegerValue[] = this.intval.split(',').map((value) => {
      const [name, val] = value.split('=');
      if (!name || !val) {
        console.error(`Invalid integer value format: ${value}`);
        return null
      }

      return new IntegerValue(name.trim(), val.trim());
    }).filter((iv) => iv !== null);

    const labels = this.labels.split(',').map((label) => label.trim()).filter((label) => label.length > 0);
    const locations = this.vloc
      .slice(1, -1)
      .split(',')
      .map((location) => location.trim());
    const zone = this.zone.trim();

    return new SimulationState(integerValues, labels, locations, zone);
  }
}

export class RawSimulationTransition {
  public guard: string;
  public reset: string;
  public src_invariant: string;
  public sync: string;
  public tgt_invariant: string;
  public vedge: string;
}

export class NextSimulationState {
  status: number;
  state: RawSimulationState;
  transition: RawSimulationTransition;
}

export class IntegerValue {
  public name: string;
  public value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

export class SimulationState {
  public integerValues: IntegerValue[];
  public labels: string[];
  public locations: string[];
  public zone: string;

  constructor(integerValues: IntegerValue[], labels: string[], locations: string[], zone: string) {
    this.integerValues = integerValues;
    this.labels = labels;
    this.locations = locations;
    this.zone = zone;
  }
}

export interface SimulationModel {
  simulationActive: boolean;
  currentState: SimulationState;
  nextStates: NextSimulationState[];

  startSimulation: (taSystem: SystemOptionType) => Promise<void>;
  stopSimulation: () => void;
  simulateNextState: (nextState: RawSimulationState) => Promise<void>;
}

type InitialStateResponse = {
  initial: NextSimulationState[];
};

type NextStateResponse = {
  current: RawSimulationState;
  next: NextSimulationState[];
};

export const useSimulationModel = (): SimulationModel => {
  console.log('Initializing SimulationModel');

  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<SimulationState | null>(null);
  const [nextStates, setNextStates] = useState<NextSimulationState[]>([]);
  const [simulatedSystem, setSimulatedSystem] = useState<SystemOptionType | null>(null);

  const startSimulation = async (taSystem: SystemOptionType) => {
    setSimulatedSystem(taSystem);
    setSimulationActive(true);
    loadInitialSimulationState(taSystem);
  };

  const stopSimulation = () => {
    setSimulationActive(false);
    setCurrentState(null);
    setNextStates([]);
  };

  const loadInitialSimulationState = async (taSystem: SystemOptionType) => {
    const [response, error] = await TCheckerUtils.callSimulate(taSystem, null);
    console.log('Loading initial simulation state:', response, error);
    if (error) {
      console.error('Error starting simulation:', error);
      return;
    }

    const initialState = JSON.parse(response) as InitialStateResponse;
    setCurrentState(new RawSimulationState().fromJson(initialState.initial[0].state).parse());
    console.log(initialState);
    setNextStates([]);

    const [nextStateResponse, nextStateError] = await TCheckerUtils.callSimulate(
      taSystem,
      initialState.initial[0].state
    );

    if (nextStateError) {
      console.error('Error fetching next simulation states:', nextStateError);
      return;
    }

    const nextStatesData = JSON.parse(nextStateResponse) as NextStateResponse;

    setNextStates(nextStatesData.next);
  };

  const simulateNextState = async (nextState: RawSimulationState) => {
    if (!simulatedSystem) {
      console.error('No simulated system available');
      return;
    }

    const [response, error] = await TCheckerUtils.callSimulate(simulatedSystem, nextState);
    if (error) {
      console.error('Error fetching next simulation states:', error);
      return;
    }

    const nextStateData = JSON.parse(response) as NextStateResponse;

    setCurrentState(new RawSimulationState().fromJson(nextStateData.current).parse());
    setNextStates(nextStateData.next);
  };

  return {
    simulationActive,
    currentState,
    nextStates,
    startSimulation,
    stopSimulation,
    simulateNextState,
  };
};
