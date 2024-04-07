import { useCallback, useEffect, useMemo, useState } from 'react';
import { Location } from '../model/ta/location';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { Clock } from '../model/ta/clock';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClockComparator } from '../model/ta/clockComparator';
import { Switch } from '../model/ta/switch';
import { useMathUtils } from '../utils/mathUtils';
import { useClockConstraintUtils } from '../utils/clockConstraintUtils';

export interface AnalysisViewModel {
  state: AnalysisState;
  ta: TimedAutomaton;
  addLocation: (
    viewModel: AnalysisViewModel,
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint
  ) => void;
  editLocation: (
    viewModel: AnalysisViewModel,
    locationName: string,
    prevLocationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint
  ) => void;
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
  const { clockConstraintsEqual } = useClockConstraintUtils();

  const initAutomaton: TimedAutomaton = useMemo(() => {
    const clock1: Clock = { name: 'x' };
    const clock2: Clock = { name: 'y' };
    const clockConstraint1: ClockConstraint = {
      clauses: [
        {
          lhs: clock1,
          op: ClockComparator.LESSER,
          rhs: 5,
        },
      ],
    };
    const clockConstraint2: ClockConstraint = {
      clauses: [
        {
          lhs: clock1,
          op: ClockComparator.GREATER,
          rhs: 1,
        },
        {
          lhs: clock2,
          op: ClockComparator.GEQ,
          rhs: 3,
        },
      ],
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

  const addLocation = useCallback(
    (viewModel: AnalysisViewModel, locationName: string, isInitial?: boolean, invariant?: ClockConstraint) => {
      const ta = viewModel.ta;
      const locations = ta.locations;
      let newLoc: Location;
      if (locations) {
        const xCoordAvg = avgRounded(locations.map((l) => l.xCoordinate));
        const yCoordAvg = avgRounded(locations.map((l) => l.yCoordinate));
        newLoc = {
          name: locationName,
          isInitial: isInitial,
          invariant: invariant,
          xCoordinate: xCoordAvg,
          yCoordinate: yCoordAvg,
        };
      } else {
        newLoc = { name: locationName, isInitial: true, invariant: invariant, xCoordinate: 0, yCoordinate: 0 };
      }
      const updatedLocs = [...locations, newLoc];
      if (isInitial) {
        updatedLocs.forEach((loc) => {
          if (loc.name !== locationName) {
            loc.isInitial = false;
          }
        });
      }
      const updatedTa = { ...ta, locations: updatedLocs };
      setViewModel({ ...viewModel, ta: updatedTa });
    },
    [avgRounded]
  );

  const editLocation = useCallback(
    (
      viewModel: AnalysisViewModel,
      locationName: string,
      prevLocationName: string,
      isInitial?: boolean,
      invariant?: ClockConstraint
    ) => {
      const ta = viewModel.ta;
      const locations = [...ta.locations];
      const loc = locations.filter((l) => l.name === prevLocationName)[0];
      loc.name = locationName;
      loc.invariant = invariant;
      const updatedTa = { ...ta, locations: locations };
      const updatedViewModel = { ...viewModel, ta: updatedTa };
      setViewModel(updatedViewModel);

      // make sure to set initial location correctly
      if (isInitial) {
        setInitialLocation(updatedViewModel, locationName);
      } else if (locations.filter((l) => !!l.isInitial).length !== 1) {
        // if not exactly one initial location: set first in array to initial
        // (when editing, there is at least one location)
        setInitialLocation(updatedViewModel, locations[0].name);
      }
    },
    [setInitialLocation]
  );

  const removeLocation = useCallback((viewModel: AnalysisViewModel, locationName: string) => {
    const ta = viewModel.ta;
    const wasInitial = ta.locations.filter((l) => l.name === locationName)[0].isInitial;
    const updatedLocs = ta.locations.filter((l) => l.name !== locationName);
    if (wasInitial && updatedLocs) {
      updatedLocs[0].isInitial = true;
    }
    const updatedSwitches = ta.switches.filter((s) => s.source.name !== locationName && s.target.name !== locationName);
    const updatedTa = { ...ta, locations: updatedLocs, switches: updatedSwitches };
    setViewModel({ ...viewModel, ta: updatedTa });
  }, []);

  const updateLocationCoordinates = useCallback(
    (viewModel: AnalysisViewModel, locationName: string, xCoordinate: number, yCoordinate: number) => {
      const ta = viewModel.ta;
      const updatedLocs = [...ta.locations];
      const loc = updatedLocs.filter((l) => l.name === locationName)[0];
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
    // TODO: delete all constraints using the clock?
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

  const removeSwitch = useCallback(
    (viewModel: AnalysisViewModel, switchToRemove: Switch) => {
      const ta = viewModel.ta;
      const { source, guard, actionLabel, reset, target } = switchToRemove;
      const resetNames = reset.map((c) => c.name);
      const updatedSwitches: Switch[] = [];

      for (const sw of ta.switches) {
        const hasEqualSource = sw.source.name === source.name;
        const hasEqualTarget = sw.target.name === target.name;
        const swGuard = sw.guard;
        const hasEqualGuard = clockConstraintsEqual(guard, swGuard);
        const hasEqualLabel = sw.actionLabel === actionLabel;
        const hasEqualReset =
          sw.reset.length === reset.length && sw.reset.filter((r) => !resetNames.includes(r.name)).length === 0;

        if (!hasEqualSource || !hasEqualTarget || !hasEqualGuard || !hasEqualLabel || !hasEqualReset) {
          updatedSwitches.push(sw);
        }
      }

      const updatedTa = { ...ta, switches: updatedSwitches };
      setViewModel({ ...viewModel, ta: updatedTa });
    },
    [clockConstraintsEqual]
  );

  const [viewModel, setViewModel] = useState<AnalysisViewModel>({
    state: AnalysisState.INIT,
    ta: initAutomaton,
    addLocation: addLocation,
    editLocation: editLocation,
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
