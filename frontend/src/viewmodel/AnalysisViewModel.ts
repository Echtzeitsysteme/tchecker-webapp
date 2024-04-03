import { useCallback, useEffect, useMemo, useState } from 'react';
import { Location } from '../model/ta/location';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { Clock } from '../model/ta/clock';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClockComparator } from '../model/ta/clockComparator';
import { Switch } from '../model/ta/switch';
import { useMathUtils } from '../utils/mathUtils';

export interface AnalysisViewModel {
  state: AnalysisState;
  ta: TimedAutomaton;
  addLocation: (viewModel: AnalysisViewModel, locationName: string) => void;
  removeLocation: (viewModel: AnalysisViewModel, locationName: string) => void;
  setInitialLocation: (viewModel: AnalysisViewModel, locationName: string) => void;
  updateLocationCoordinates: (
    viewModel: AnalysisViewModel,
    locationName: string,
    xCoordinate: number,
    yCoordinate: number
  ) => void;
  addClock: (viewModel: AnalysisViewModel, clockName: string) => void;
  removeClock: (viewModel: AnalysisViewModel, clockName: string) => void;
  addSwitch: (
    viewModel: AnalysisViewModel,
    source: Location,
    target: Location,
    actionLabel: string,
    reset?: Clock[],
    guard?: ClockConstraint
  ) => void;
  removeSwitch: (viewModel: AnalysisViewModel, switchToRemove: Switch) => void;
}

export enum AnalysisState {
  INIT = 'INIT',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  RESET = 'RESET',
}

export function useAnalysisViewModel(): AnalysisViewModel {
  const { avgRounded } = useMathUtils();

  const initAutomaton: TimedAutomaton = useMemo(() => {
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
      actionLabel: 'start',
      reset: [clock1],
      target: loc2,
    };
    return {
      locations: [loc1, loc2],
      clocks: [clock1, clock2],
      switches: [switch1],
    };
  }, []);

  const addLocation = useCallback(
    (viewModel: AnalysisViewModel, locationName: string) => {
      const ta = viewModel.ta;
      const locations = ta.locations;
      const xCoordAvg = avgRounded(locations.map((l) => l.xCoordinate));
      const yCoordAvg = avgRounded(locations.map((l) => l.yCoordinate));
      const newLoc: Location = { name: locationName, xCoordinate: xCoordAvg, yCoordinate: yCoordAvg };
      const updatedLocs = [...locations, newLoc];
      const updatedTa = { ...ta, locations: updatedLocs };
      setViewModel({ ...viewModel, ta: updatedTa });
    },
    [avgRounded]
  );

  const removeLocation = useCallback((viewModel: AnalysisViewModel, locationName: string) => {
    const ta = viewModel.ta;
    const updatedLocs = ta.locations.filter((l) => l.name !== locationName);
    const updatedSwitches = ta.switches.filter((s) => s.source.name !== locationName && s.target.name !== locationName);
    const updatedTa = { ...ta, locations: updatedLocs, switches: updatedSwitches };
    setViewModel({ ...viewModel, ta: updatedTa });
  }, []);

  const setInitialLocation = useCallback((viewModel: AnalysisViewModel, locationName: string) => {
    const ta = viewModel.ta;
    const updatedLocs = [...ta.locations];
    updatedLocs.forEach((l) => {
      if (l.name === locationName) {
        l.isInitial = true;
      } else {
        l.isInitial = false;
      }
    });
    const updatedTa = { ...ta, locations: updatedLocs };
    setViewModel({ ...viewModel, ta: updatedTa });
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

  const addClock = useCallback((viewModel: AnalysisViewModel, clockName: string) => {
    const ta = viewModel.ta;
    const updatedClocks = [...ta.clocks, { name: clockName }];
    const updatedTa = { ...ta, clocks: updatedClocks };
    setViewModel({ ...viewModel, ta: updatedTa });
  }, []);

  const removeClock = useCallback((viewModel: AnalysisViewModel, clockName: string) => {
    const ta = viewModel.ta;
    const updatedClocks = ta.clocks.filter((c) => c.name !== clockName);
    const updatedTa = { ...ta, clocks: updatedClocks };
    setViewModel({ ...viewModel, ta: updatedTa });
  }, []);

  const addSwitch = useCallback(
    (
      viewModel: AnalysisViewModel,
      source: Location,
      target: Location,
      actionLabel: string,
      reset?: Clock[],
      guard?: ClockConstraint
    ) => {
      const ta = viewModel.ta;
      const newSwitch: Switch = {
        source: source,
        target: target,
        actionLabel: actionLabel,
        reset: reset ?? [],
        guard: guard,
      };
      const updatedSwitches = [...ta.switches, newSwitch];
      const updatedTa = { ...ta, switches: updatedSwitches };
      setViewModel({ ...viewModel, ta: updatedTa });
    },
    []
  );

  const removeSwitch = useCallback((viewModel: AnalysisViewModel, switchToRemove: Switch) => {
    const ta = viewModel.ta;
    const { source, guard, actionLabel, reset, target } = switchToRemove;
    const resetNames = reset.map((c) => c.name);
    const updatedSwitches: Switch[] = [];

    for (const sw of ta.switches) {
      const hasEqualSource = sw.source.name === source.name;
      const hasEqualTarget = sw.target.name === target.name;
      const swGuard = sw.guard;
      const hasEqualGuard =
        (!guard && !swGuard) ||
        (swGuard?.lhs.name === guard?.lhs.name && swGuard?.op === guard?.op && swGuard?.rhs === guard?.rhs);
      const hasEqualLabel = sw.actionLabel === actionLabel;
      const hasEqualReset =
        sw.reset.length === reset.length && sw.reset.filter((r) => !resetNames.includes(r.name)).length === 0;

      if (!hasEqualSource || !hasEqualTarget || !hasEqualGuard || !hasEqualLabel || !hasEqualReset) {
        updatedSwitches.push(sw);
      }
    }

    const updatedTa = { ...ta, switches: updatedSwitches };
    setViewModel({ ...viewModel, ta: updatedTa });
  }, []);

  const [viewModel, setViewModel] = useState<AnalysisViewModel>({
    state: AnalysisState.INIT,
    ta: initAutomaton,
    addLocation: addLocation,
    removeLocation: removeLocation,
    setInitialLocation: setInitialLocation,
    updateLocationCoordinates: updateLocationCoordinates,
    addClock: addClock,
    removeClock: removeClock,
    addSwitch: addSwitch,
    removeSwitch: removeSwitch,
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
