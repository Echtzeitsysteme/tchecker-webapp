import { useCallback, useEffect, useState } from 'react';
import { Location } from '../model/ta/location';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { Clock } from '../model/ta/clock';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { Switch } from '../model/ta/switch';
import { useMathUtils } from '../utils/mathUtils';
import { useSwitchUtils } from '../utils/switchUtils';
import { useClockConstraintUtils } from '../utils/clockConstraintUtils';
import { useClockUtils } from '../utils/clockUtils';
import { INIT_AUTOMATON } from '../utils/initAutomaton';
import {SwitchStatement} from "../model/ta/switchStatement.ts";

export interface AnalysisViewModel {
  state: AnalysisState;
  ta: TimedAutomaton;
  addLocation: (
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    committed?: boolean,
    urgent?: boolean,
    labels?: string[]
  ) => void;
  editLocation: (
    locationName: string,
    prevLocationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    committed?: boolean,
    urgent?: boolean,
    labels?: string[]
  ) => void;
  removeLocation: (locationName: string) => void;
  setInitialLocation: (locationName: string) => void;
  updateLocationCoordinates: (
    locationName: string,
    xCoordinate: number,
    yCoordinate: number
  ) => void;
  addSwitch: (
    sourceName: string,
    actionLabel: string,
    resetNames: string[],
    targetName: string,
    guard?: ClockConstraint,
    statement?: SwitchStatement
  ) => void;
  editSwitch: (
    prevSwitch: Switch,
    sourceName: string,
    action: string,
    resetNames: string[],
    targetName: string,
    guard?: ClockConstraint,
    statement?: SwitchStatement
  ) => void;
  removeSwitch: (switchToRemove: Switch) => void;
  addClock: (clockName: string, size: number) => void;
  editClock: (clockName: string, size: number, prevClockName: string) => void;
  removeClock: (clock: Clock) => void;
  setAutomaton : (ta: TimedAutomaton) => void;
}

export enum AnalysisState {
  INIT = 'INIT',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  RESET = 'RESET',
}

export function useAnalysisViewModel(): AnalysisViewModel {
  const { avgRounded } = useMathUtils();
  const { switchesEqual } = useSwitchUtils();
  const { removeAllClausesUsingClock } = useClockConstraintUtils();
  const { removeClockFromAllResets } = useSwitchUtils();
  const { renameClock } = useClockUtils();

  const [state, setState] = useState<AnalysisState>(AnalysisState.INIT);
  const [ta, setTa] = useState<TimedAutomaton>(INIT_AUTOMATON);

  // ===================================================================================================================

  useEffect(() => {
    if (state === AnalysisState.INIT) {
      // nothing to initialize at the moment, just set state to READY
      setState(AnalysisState.READY);
    }
    else if (state === AnalysisState.ANALYZING) {
      // TODO: analyze TA
      setState(AnalysisState.READY);
    }
    else if (state === AnalysisState.RESET) {
      // TODO: add a reset button to use this reset
      setTa(INIT_AUTOMATON);
      setState(AnalysisState.READY);
    }
  }, [state]);

  // ===== manipulate locations ================================================

  const setInitialLocation = useCallback((locationName: string) => {
    const updatedLocs = {...ta.locations};

    updatedLocs.forEach((l) => {
      if (l.name === locationName) {
        l.isInitial = true;
      } else {
        l.isInitial = false;
      }
    });

    setTa({ ...ta, locations: updatedLocs });
  }, [ta]);

  const addLocation = useCallback(
    (locationName: string, isInitial?: boolean, invariant?: ClockConstraint, committed?: boolean,
     urgent?: boolean, labels?: string[]) => {

      const locations = ta.locations;
      let newLoc: Location;

      if (locations) {
        const xCoordAvg = avgRounded(locations.map((l) => l.xCoordinate));
        const yCoordAvg = avgRounded(locations.map((l) => l.yCoordinate));
        newLoc = {
          name: locationName,
          isInitial: isInitial,
          invariant: invariant,
          committed: committed,
          urgent: urgent,
          labels: labels,
          xCoordinate: xCoordAvg,
          yCoordinate: yCoordAvg,
          setLayout: true,
        };
      } else {
        newLoc = { name: locationName, isInitial: true, invariant: invariant, 
          committed: committed, urgent: urgent, labels: labels, xCoordinate: 0, yCoordinate: 0, setLayout: true, };
      }

      const updatedLocs = [...locations, newLoc];
      if (isInitial) {
        updatedLocs.forEach((loc) => {
          if (loc.name !== locationName) {
            loc.isInitial = false;
          }
        });
      }
      
      setTa({ ...ta, locations: updatedLocs });
    }, [ta]);

  const editLocation = useCallback(
    (
      locationName: string,
      prevLocationName: string,
      isInitial?: boolean,
      invariant?: ClockConstraint,
      committed?: boolean,
      urgent?: boolean,
      labels?: string[]
    ) => {

      const locations = [...ta.locations];
      const loc = locations.filter((l) => l.name === prevLocationName)[0];
      loc.name = locationName;
      loc.invariant = invariant;
      loc.committed = committed;
      loc.urgent = urgent;
      loc.labels = labels;
      setTa({ ...ta, locations: locations });

      // make sure to set initial location correctly
      const isOtherLocInitial =
        locations.filter((l) => l.name !== locationName).filter((l) => !!l.isInitial).length === 1;
      if (isInitial) {
        setInitialLocation(locationName);
      } else if (!isOtherLocInitial) {
        // if not exactly one initial location: set first in array to initial
        // (when editing, there is at least one location)
        setInitialLocation(locations[0].name);
      }
    }, [ta]);

  const removeLocation = useCallback((locationName: string) => {
    if (ta.locations.length <= 1) {
      return;
    }

    const wasInitial = ta.locations.filter((l) => l.name === locationName)[0].isInitial;
    const updatedLocs = ta.locations.filter((l) => l.name !== locationName);
    if (wasInitial && updatedLocs) {
      updatedLocs[0].isInitial = true;
    }

    const updatedSwitches = ta.switches.filter((s) => s.source.name !== locationName && s.target.name !== locationName);
    setTa({ ...ta, locations: updatedLocs, switches: updatedSwitches });
  }, [ta]);

  const updateLocationCoordinates = useCallback(
    (locationName: string, xCoordinate: number, yCoordinate: number) => {
      const updatedLocs = [...ta.locations];
      const loc = updatedLocs.filter((l) => l.name === locationName)[0];

      loc.xCoordinate = xCoordinate;
      loc.yCoordinate = yCoordinate;
      loc.setLayout = true;

      setTa({ ...ta, locations: updatedLocs });
    }, [ta]);

  // ===== manipulate switches =================================================

  const addSwitch = useCallback(
    (
      sourceName: string,
      actionLabel: string,
      resetNames: string[],
      targetName: string,
      guard?: ClockConstraint,
      statement?: SwitchStatement
    ) => {
      const newSwitch: Switch = {
        source: ta.locations.filter((l) => l.name === sourceName)[0],
        target: ta.locations.filter((l) => l.name === targetName)[0],
        actionLabel: actionLabel,
        reset: ta.clocks.filter((c) => resetNames.includes(c.name)),
        guard: guard,
        statement: statement
      };
      const updatedSwitches = [...ta.switches, newSwitch];
      setTa({ ...ta, switches: updatedSwitches });
    }, [ta]);

  const editSwitch = useCallback(
    (
      prevSwitch: Switch,
      sourceName: string,
      action: string,
      resetNames: string[],
      targetName: string,
      guard?: ClockConstraint,
      statement?: SwitchStatement
    ) => {
      const switches = [...ta.switches];
      const switchToEdit = switches.filter((sw) => switchesEqual(sw, prevSwitch))[0];
      switchToEdit.source = ta.locations.filter((l) => l.name === sourceName)[0];
      switchToEdit.target = ta.locations.filter((l) => l.name === targetName)[0];
      switchToEdit.actionLabel = action;
      switchToEdit.reset = ta.clocks.filter((c) => resetNames.includes(c.name));
      switchToEdit.guard = guard;
      switchToEdit.statement = statement;
      setTa({ ...ta, switches: switches });
    }, [ta]);

  const removeSwitch = useCallback(
    (switchToRemove: Switch) => {
      const updatedSwitches: Switch[] = [];

      for (const sw of ta.switches) {
        if (!switchesEqual(sw, switchToRemove)) {
          updatedSwitches.push(sw);
        }
      }

      setTa({ ...ta, switches: updatedSwitches });
    }, [ta]);

  // ===== manipulate clocks ===================================================

  const addClock = useCallback((clockName: string, size: number) => {
    const updatedClocks = [...ta.clocks, { name: clockName, size: size }];
    setTa({ ...ta, clocks: updatedClocks });
  }, [ta]);

  const editClock = useCallback( 
    (clockName: string, size: number, prevClockName: string) => {
      const updatedTa = { ...ta };
      renameClock(prevClockName, clockName, updatedTa);
      const changedClock = updatedTa.clocks.filter((clock) => clock.name === clockName)[0]; // ?
      changedClock.size = size;
      setTa(updatedTa);
    }, [ta]);

  const removeClock = useCallback(
    (clock: Clock) => {
      let updatedTa = { ...ta };

      removeAllClausesUsingClock(clock, updatedTa);
      removeClockFromAllResets(clock, updatedTa);

      const updatedClocks = updatedTa.clocks.filter((c) => c.name !== clock.name);
      setTa({ ...updatedTa, clocks: updatedClocks })
    }, [ta]);

  const setAutomaton = useCallback(
      (ta: TimedAutomaton) => {
        setTa(ta);
        setState(AnalysisState.READY);
      },
      [ta]
  );

  // ===================================================================================================================

  return {
    state,
    ta,
    addLocation,
    editLocation,
    removeLocation,
    setInitialLocation,
    updateLocationCoordinates,
    addSwitch,
    editSwitch,
    removeSwitch,
    addClock,
    editClock,
    removeClock,
    setAutomaton,
  };
}
