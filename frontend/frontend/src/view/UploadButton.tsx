import React from 'react';

import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import { TimedAutomaton } from '../model/ta/timedAutomaton.ts';
import timedAutomata from '../parser/timedAutomata';
import { Clock } from '../model/ta/clock.ts';
import { Location } from '../model/ta/location.ts';
import { ClockConstraint } from '../model/ta/clockConstraint.ts';
import { Switch } from '../model/ta/switch.ts';
import { Button } from '@mui/material';
import { AutomatonOptionType, OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';
import { OpenedSystems, SystemOptionType } from '../viewmodel/OpenedSystems.ts';
import { Integer } from '../model/ta/integer.ts';
import { handleConstr, handleStatement } from '../utils/uploadUtils.ts';
import { FreeClause } from '../model/ta/freeClause.ts';
import { SwitchStatement } from '../model/ta/switchStatement.ts';
import { SyncConstraint } from '../model/ta/syncConstraint.ts';
import { Sync } from '../model/ta/sync.ts';
import { useTranslation } from 'react-i18next';

export interface OpenedDocs {
  viewModel: AnalysisViewModel; //für update Locations iwie?
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}

const parseFile = async (fileContent: string) => {
  const parser = new timedAutomata.Parser();
  const parsedData = parser.parse(fileContent);

  return parsedData;
};

const convertToTa = async (parsedData): Promise<SystemOptionType> => {
  const systemName: string = parsedData.system.name;
  const taProcesses: AutomatonOptionType[] = [];
  const integers: Integer[] = [];
  const synchronizations: SyncConstraint[] = [];

  parsedData.items.forEach((item) => {
    if (item.type == 'process') {
      const name: string = item.name;
      const TA: TimedAutomaton = {
        locations: [],
        clocks: [],
        switches: [],
      };
      taProcesses.push({ label: name, automaton: TA });
    }
  });
  parsedData.items.forEach((item) => {
    /*TODO if(item.type == 'event') {

    }*/
    if (item.type == 'clock') {
      const newClock: Clock = { name: item.name, size: item.amount };
      taProcesses.forEach((option) => {
        option.automaton.clocks.push(newClock);
      });
    }

    if (item.type == 'int') {
      const name: string = item.name;
      const size: number = item.size;
      const min: number = item.min;
      const max: number = item.max;
      const init: number = item.init;
      const newInteger: Integer = { name: name, size: size, min: min, max: max, init: init };
      integers.push(newInteger);
    }

    if (item.type == 'location') {
      const processName: string = item.processName;
      const locName: string = item.name;
      let isInitial: boolean = false;
      let xCoord: number = 0;
      let yCoord: number = 0;
      let isUrgent: boolean = false;
      let isCommitted: boolean = false;
      let hasLabels: boolean = false;
      let labelList: string[] = [];
      let setLayout: boolean = false;
      const invariants: ClockConstraint = { clauses: [], freeClauses: [] };
      if (item.attributes !== undefined) {
        item.attributes.forEach((attribute) => {
          if (attribute.initial !== undefined) {
            isInitial = true;
          }
          if (attribute.invariant !== undefined) {
            attribute.constraint.forEach((constr) => {
              const newFreeClause: FreeClause = { term: handleConstr(constr) };
              invariants.freeClauses.push(newFreeClause);
            });
          }
          if (attribute.layout !== undefined) {
            xCoord = attribute.x;
            yCoord = attribute.y;
            setLayout = true;
          } else {
            xCoord = 0;
            yCoord = 0;
          }
          if (attribute.labels !== undefined) {
            hasLabels = true;
            labelList = attribute.labelList;
          }
          if (attribute.committed !== undefined) {
            isCommitted = true;
          }
          if (attribute.urgent !== undefined) {
            isUrgent = true;
          }
        });
      }
      const newLocation: Location = {
        name: locName,
        isInitial: isInitial,
        committed: isCommitted,
        urgent: isUrgent,
        xCoordinate: xCoord,
        yCoordinate: yCoord,
        setLayout: setLayout,
      };
      if (invariants.freeClauses.length > 0 || invariants.clauses.length > 0) {
        newLocation.invariant = invariants;
      }
      if (hasLabels) {
        newLocation.labels = labelList;
      }
      taProcesses.forEach((option) => {
        if (option.label == processName) {
          option.automaton.locations.push(newLocation);
        }
      });
    }

    if (item.type == 'edge') {
      const processName: string = item.processName;
      const actionLabel: string = item.event;
      const sourceName: string = item.source;
      const targetName: string = item.target;
      let source: Location;
      let target: Location;
      taProcesses.forEach((option) => {
        if (option.label == processName) {
          source = option.automaton.locations.filter((location) => location.name === sourceName)[0];
          target = option.automaton.locations.filter((location) => location.name === targetName)[0];
        }
      });

      const guard: ClockConstraint = { clauses: [], freeClauses: [] };
      const statement: SwitchStatement = { statements: [] };
      const setClocks: Clock[] = [];
      if (item.attributes !== undefined) {
        item.attributes.forEach((attribute) => {
          if (attribute.provided !== undefined) {
            attribute.constraint.forEach((constr) => {
              const newFreeClause: FreeClause = { term: handleConstr(constr) };
              guard.freeClauses.push(newFreeClause);
            });
          }
          if (attribute.do !== undefined) {
            attribute.maths.forEach((math) => {
              const doStatement = handleStatement(math);
              if (typeof doStatement === 'string') {
                const newTerm: FreeClause = { term: doStatement };
                statement.statements.push(newTerm);
              } else {
                //look if the do-statement is a clock-reset
                const potentialClock = doStatement.lhs;
                const set = doStatement.set;
                const rhs = doStatement.rhs;
                taProcesses.forEach((option) => {
                  if (option.label == processName) {
                    let isReset: boolean = false;
                    let setClock: Clock;
                    option.automaton.clocks.forEach((clock) => {
                      if (clock.name === potentialClock && set === '=' && parseInt(rhs) === 0) {
                        isReset = true;
                        setClock = clock;
                      }
                    });
                    if (isReset) {
                      setClocks.push(setClock);
                    }
                    //was not clock-reset, so add as normal do-statement
                    else {
                      const altDoStatement = potentialClock + set + rhs;
                      const newTerm: FreeClause = { term: altDoStatement };
                      statement.statements.push(newTerm);
                    }
                  }
                });
              }
            });
          }
        });
      }
      const newSwitch: Switch = { source: source, actionLabel: actionLabel, reset: setClocks, target: target };
      if (guard.clauses.length > 0 || guard.freeClauses.length > 0) {
        newSwitch.guard = guard;
      }
      if (statement.statements.length > 0) {
        newSwitch.statement = statement;
      }
      taProcesses.forEach((option) => {
        if (option.label == processName) {
          option.automaton.switches.push(newSwitch);
        }
      });
    }

    if (item.type == 'sync') {
      const newSyncConstr: SyncConstraint = { syncs: [] };
      item.syncConstr.forEach((sync) => {
        const newSync: Sync = { process: sync.process, event: sync.event };
        newSync.weakSynchronisation = !!sync.weakSync;
        newSyncConstr.syncs.push(newSync);
      });
      synchronizations.push(newSyncConstr);
    }
  });

  /*//Filter unnecessary clocks
  taProcesses.forEach((ta)=> {
    const guards = ta.automaton.switches.map((sw) => sw.guard);
    const invariants = ta.automaton.locations.map((loc) => loc.invariant);
    const guardsAndInvars = [...guards, ...invariants].filter((constraint) => {return constraint !== undefined});
    ta.automaton.clocks = ta.automaton.clocks.filter((clock) => {
      return guardsAndInvars.filter((cc) => { return constraintUsesClock(clock.name, cc)}).length > 0;
    });
  });*/

  const systemOption: SystemOptionType = {
    label: systemName,
    processes: taProcesses,
    integers: integers,
    synchronizations: synchronizations,
  };
  console.log('All processes:', taProcesses);
  return systemOption;
};

const UploadButton: React.FC<OpenedDocs> = (props) => {
  const { viewModel, openedSystems, openedProcesses } = props;
  const { t } = useTranslation();

  const handleClick = (uploadedFileEvent: React.ChangeEvent<HTMLInputElement>) => {
    const inputElem = uploadedFileEvent.target as HTMLInputElement & {
      files: FileList;
    };

    if (!inputElem.files[0] || !inputElem.files[0].name.endsWith('.tck')) {
      console.log('Invalid or no File');
      return;
    }
    console.log('inputFile:', inputElem.files[0]); //eingelesene File

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const fileContent = fileReader.result as string;
      console.log('fileContent:', fileContent);

      try {
        const parsedData = await parseFile(fileContent);
        console.log('parsed Data:', parsedData);
        const systemOption = await convertToTa(parsedData);
        let systemName = systemOption.label;

        const one = 1;
        openedSystems.systemOptions.forEach((option) => {
          if (option.label === systemName) {
            systemName += '__' + String(one);
          }
        });
        const processes: AutomatonOptionType[] = systemOption.processes;
        const integers: Integer[] = systemOption.integers;
        const synchronizations: SyncConstraint[] = systemOption.synchronizations;
        const newSystem: SystemOptionType = {
          label: systemName,
          processes: processes,
          integers: integers,
          synchronizations: synchronizations,
        };

        openedProcesses.selectedOption.automaton = viewModel.ta;
        openedSystems.selectedSystem.processes = openedProcesses.automatonOptions;
        openedSystems.addSystemOption(openedSystems, newSystem);

        openedSystems.selectedSystem = newSystem;
        openedProcesses.setAutomatonOptions(openedProcesses, newSystem.processes);
        viewModel.setAutomaton(viewModel, openedProcesses.selectedOption.automaton);

        console.log('openedSystems:', openedSystems);
      } catch (error) {
        console.error(error);
      }
    };
    fileReader.readAsText(inputElem.files[0]);

    inputElem.value = '';
  };

  return (
    <label htmlFor="uploadFile">
      <Button variant="contained" component="label">
        {t('uploadButton.button')}
        <input id="uploadFile" type="file" accept=".tck" onChange={handleClick} />
      </Button>
    </label>
  );
};

export default UploadButton;
