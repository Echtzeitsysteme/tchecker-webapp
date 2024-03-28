import { useCallback, useEffect, useMemo, useState } from 'react';
import { Location } from '../model/ta/location';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { Action } from '../model/ta/action';
import { Clock } from '../model/ta/clock';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClockComparator } from '../model/ta/clockComparator';
import { Switch } from '../model/ta/switch';

export interface AnalysisViewModel {
  state: AnalysisState;
  ta: TimedAutomaton;
  updateLocationCoordinates: (
    viewModel: AnalysisViewModel,
    locationName: string,
    xCoordinate: number,
    yCoordinate: number
  ) => void;
}

export enum AnalysisState {
  INIT = 'INIT',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  RESET = 'RESET',
}

export function useAnalysisViewModel(): AnalysisViewModel {
  const initAutomaton: TimedAutomaton = useMemo(() => {
    const action: Action = { name: 'start' };
    const clock1: Clock = { name: 'x' };
    const clock2: Clock = { name: 'y' };
    const clockConstraint1: ClockConstraint = {
      lhs: clock1,
      op: ClockComparator.LESSER,
      rhs: 5,
    };
    const clockConstraint2: ClockConstraint = {
      lhs: clock2,
      op: ClockComparator.GEQ,
      rhs: 3,
    };
    const loc1: Location = {
      name: 'init',
      isInitial: true,
      invariant: clockConstraint1,
      xCoordinate: -100,
      yCoordinate: 100,
    };
    const loc2: Location = {
      name: 'final',
      xCoordinate: 100,
      yCoordinate: 100,
    };
    const switch1: Switch = {
      source: loc1,
      guard: clockConstraint2,
      action: action,
      reset: [clock1],
      target: loc2,
    };
    return {
      locations: [loc1, loc2],
      actions: [action],
      clocks: [clock1, clock2],
      switches: [switch1],
    };
  }, []);

  const updateLocationCoordinates = useCallback(
    (viewModel: AnalysisViewModel, locationName: string, xCoordinate: number, yCoordinate: number) => {
      const ta = viewModel.ta;
      const updatedLocs = [...ta.locations];
      const loc = updatedLocs.filter((l) => l.name === locationName)[0]; // locations are identified by name
      loc.xCoordinate = xCoordinate;
      loc.yCoordinate = yCoordinate;
      const updatedTa = { ...ta, locations: updatedLocs };
      setViewModel({ ...viewModel, ta: updatedTa });
    },
    []
  );

  const [viewModel, setViewModel] = useState<AnalysisViewModel>({
    state: AnalysisState.INIT,
    ta: initAutomaton,
    updateLocationCoordinates: updateLocationCoordinates,
  });

  // ===================================================================================================================

  useEffect(() => {
    if (viewModel.state === AnalysisState.INIT) {
      // nothing to initialize at the moment. just set state to READY
      setViewModel({ ...viewModel, state: AnalysisState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    if (viewModel.state === AnalysisState.ANALYZING) {
      // TODO: analyze TA
      setViewModel({ ...viewModel, state: AnalysisState.READY });
    }
  }, [viewModel]);

  useEffect(() => {
    if (viewModel.state === AnalysisState.RESET) {
      setViewModel({ ...viewModel, ta: initAutomaton, state: AnalysisState.READY });
    }
  }, [viewModel, initAutomaton]);

  // ===================================================================================================================

  return viewModel;
}
