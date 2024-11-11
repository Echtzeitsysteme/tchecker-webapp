import React, { useCallback, useMemo, useState } from 'react';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { Tooltip, Typography } from '@mui/material';
import ElementTable, { ElementRowData } from './ElementTable';
import { useTranslation } from 'react-i18next';
import { useFormattingUtils } from '../utils/formattingUtils';
import ManipulateLocationDialog from './ManipulateLocationDialog';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { Location } from '../model/ta/location';
import { Home } from '@mui/icons-material';
import ManipulateSwitchDialog from './ManipulateSwitchDialog';
import { Switch } from '../model/ta/switch';
import { Clock } from '../model/ta/clock';
import { useClockConstraintUtils } from '../utils/clockConstraintUtils';
import ClockDeleteConfirmDialog from './ClockDeleteConfirmDialog';
import ManipulateClockDialog from './ManipulateClockDialog';
import { OpenedSystems } from '../viewmodel/OpenedSystems.ts';
import { Integer } from '../model/ta/integer.ts';
import ManipulateIntegerDialog from './ManipulateIntegerDialog.tsx';
import { SwitchStatement } from '../model/ta/switchStatement.ts';
import { ManipulateSyncDialog } from './ManipulateSyncDialog.tsx';
import { SyncConstraint } from '../model/ta/syncConstraint.ts';

interface ManipulationProps {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
}

export const AutomatonManipulation: React.FC<ManipulationProps> = (props) => {
  const { viewModel, openedSystems } = props;
  const {
    ta,
    addLocation,
    editLocation,
    removeLocation,
    addSwitch,
    editSwitch,
    removeSwitch,
    addClock,
    editClock,
    removeClock,
  } = viewModel;
  const { locations, switches, clocks } = ta;
  const { selectedSystem, addInteger, editInteger, removeInteger, addSync, editSync, removeSync } = openedSystems;
  const { integers, synchronizations, processes } = selectedSystem;
  const { t } = useTranslation();
  const { formatLocationLabelTable, formatSwitchTable, formatSyncTable } = useFormattingUtils();
  const { taUsesClockInAnyConstraint } = useClockConstraintUtils();

  const [locationAddOpen, setLocationAddOpen] = useState(false);
  const [locationEditOpen, setLocationEditOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | undefined>(undefined);
  const [switchAddOpen, setSwitchAddOpen] = useState(false);
  const [switchEditOpen, setSwitchEditOpen] = useState(false);
  const [switchToEdit, setSwitchToEdit] = useState<Switch | undefined>(undefined);
  const [clockAddOpen, setClockAddOpen] = useState(false);
  const [clockEditOpen, setClockEditOpen] = useState(false);
  const [clockToEdit, setClockToEdit] = useState<Clock | undefined>(undefined);
  const [clockDeleteConfirmOpen, setClockDeleteConfirmOpen] = useState(false);
  const [clockToDelete, setClockToDelete] = useState<Clock | undefined>(undefined);
  const [integerAddOpen, setIntegerAddOpen] = useState(false);
  const [integerEditOpen, setIntegerEditOpen] = useState(false);
  const [integerToEdit, setIntegerToEdit] = useState<Integer | undefined>(undefined);
  const [syncAddOpen, setSyncAddOpen] = useState(false);
  const [syncEditOpen, setSyncEditOpen] = useState(false);
  const [syncToEdit, setSyncToEdit] = useState<SyncConstraint | undefined>(undefined);

  // ===== manipulate locations ================================================

  const handleLocationAddOpen = () => setLocationAddOpen(true);
  const handleLocationAddClose = () => setLocationAddOpen(false);
  const handleLocationEditOpen = useCallback(
    (id: number) => {
      setLocationToEdit(locations[id]);
      setLocationEditOpen(true);
    },
    [locations]
  );
  const handleLocationEditClose = () => setLocationEditOpen(false);

  const handleLocationAdd = (
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    committed?: boolean,
    urgent?: boolean,
    labels?: string[]
  ) => {
    addLocation(viewModel, locationName, isInitial, invariant, committed, urgent, labels);
    setLocationAddOpen(false);
  };

  const handleLocationEdit = (
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    committed?: boolean,
    urgent?: boolean,
    labels?: string[],
    prevLocationName?: string
  ) => {
    if (!prevLocationName) {
      throw Error('handleLocationEdit: prevLocationName is empty or undefined');
    }
    editLocation(viewModel, locationName, prevLocationName, isInitial, invariant, committed, urgent, labels);
    setLocationEditOpen(false);
  };

  const handleLocationDelete = useCallback(
    (id: number) => {
      const locationName = locations[id].name; // array access is save due to construction of location table
      removeLocation(viewModel, locationName);
    },
    [locations, viewModel, removeLocation]
  );

  const locationTable: JSX.Element = useMemo(() => {
    const locationRows = locations.map<ElementRowData>((loc, index) => {
      let displayName: JSX.Element | string;
      if (loc.isInitial) {
        displayName = (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t('manipulation.table.initLocLabel')}>
              <Home fontSize="small" data-testid={'icon-is-initial-row-' + index} />
            </Tooltip>
            <Typography variant="body1" style={{ marginLeft: 4 }}>
              {formatLocationLabelTable(loc)}
            </Typography>
          </div>
        );
      } else {
        displayName = formatLocationLabelTable(loc);
      }
      const rowData: ElementRowData = { id: index, displayName: displayName };
      return rowData;
    });
    return (
      <ElementTable
        rows={locationRows}
        contentSingular={t('manipulation.table.locSingular')}
        contentPlural={t('manipulation.table.locPlural')}
        typeForTestId={'location'}
        onAddOpen={handleLocationAddOpen}
        onEditOpen={handleLocationEditOpen}
        onDelete={handleLocationDelete}
      />
    );
  }, [locations, t, formatLocationLabelTable, handleLocationEditOpen, handleLocationDelete]);

  // ===== manipulate switches =================================================

  const handleSwitchAddOpen = () => setSwitchAddOpen(true);
  const handleSwitchAddClose = () => setSwitchAddOpen(false);
  const handleSwitchEditOpen = useCallback(
    (id: number) => {
      setSwitchToEdit(switches[id]);
      setSwitchEditOpen(true);
    },
    [switches]
  );
  const handleSwitchEditClose = () => setSwitchEditOpen(false);

  const handleSwitchAdd = (
    sourceName: string,
    action: string,
    resetNames: string[],
    targetName: string,
    guard?: ClockConstraint,
    statement?: SwitchStatement
  ) => {
    addSwitch(viewModel, sourceName, action, resetNames, targetName, guard, statement);
    setSwitchAddOpen(false);
  };

  const handleSwitchEdit = (
    sourceName: string,
    action: string,
    resetNames: string[],
    targetName: string,
    guard?: ClockConstraint,
    statement?: SwitchStatement,
    prevSwitch?: Switch
  ) => {
    if (!prevSwitch) {
      throw Error('handleSwitchEdit: prevSwitch is null or undefined');
    }
    editSwitch(viewModel, prevSwitch, sourceName, action, resetNames, targetName, guard, statement);
    setSwitchEditOpen(false);
  };

  const handleSwitchDelete = useCallback(
    (id: number) => {
      removeSwitch(viewModel, switches[id]);
    },
    [viewModel, switches, removeSwitch]
  );

  const switchTable: JSX.Element = useMemo(() => {
    const switchRows: ElementRowData[] = switches.map((sw, index) => ({
      id: index,
      displayName: formatSwitchTable(sw),
    }));
    return (
      <ElementTable
        rows={switchRows}
        contentSingular={t('manipulation.table.switchSingular')}
        contentPlural={t('manipulation.table.switchPlural')}
        typeForTestId={'switch'}
        onAddOpen={handleSwitchAddOpen}
        onEditOpen={handleSwitchEditOpen}
        onDelete={handleSwitchDelete}
      />
    );
  }, [switches, t, formatSwitchTable, handleSwitchEditOpen, handleSwitchDelete]);

  // ===== manipulate clocks ===================================================

  const handleClockAddOpen = () => setClockAddOpen(true);
  const handleClockAddClose = () => setClockAddOpen(false);
  const handleClockEditOpen = useCallback(
    (id: number) => {
      setClockToEdit(clocks[id]);
      setClockEditOpen(true);
    },
    [clocks]
  );
  const handleClockEditClose = () => setClockEditOpen(false);

  const handleClockAdd = (clockName: string, size: string) => {
    addClock(viewModel, clockName, parseInt(size));
    setClockAddOpen(false);
  };

  const handleClockEdit = (clockName: string, size: string, prevClockName?: string) => {
    if (!prevClockName) {
      throw Error('handleClockEdit: prevClockName is null or undefined or empty');
    }
    editClock(viewModel, clockName, parseInt(size), prevClockName);
    setClockEditOpen(false);
  };

  const handleClockDeleteOpen = () => setClockDeleteConfirmOpen(true);
  const handleClockDeleteClose = () => setClockDeleteConfirmOpen(false);

  const deleteClock = useCallback(
    (clock: Clock) => {
      handleClockDeleteClose();
      removeClock(viewModel, clock);
    },
    [removeClock, viewModel]
  );

  const handleClockDelete = useCallback(
    (id: number) => {
      const clockToDelete = clocks[id];
      if (!taUsesClockInAnyConstraint(ta, clockToDelete)) {
        deleteClock(clockToDelete);
      } else {
        setClockToDelete(clockToDelete);
        handleClockDeleteOpen();
      }
    },
    [clocks, ta, deleteClock, taUsesClockInAnyConstraint]
  );

  const clockTable: JSX.Element = useMemo(() => {
    const clockRows = clocks.map((clock, index) => ({ id: index, displayName: clock.name + ', size:' + clock.size }));
    return (
      <ElementTable
        rows={clockRows}
        contentSingular={t('manipulation.table.clockSingular')}
        contentPlural={t('manipulation.table.clockPlural')}
        typeForTestId={'clock'}
        onAddOpen={handleClockAddOpen}
        onEditOpen={handleClockEditOpen}
        onDelete={handleClockDelete}
      />
    );
  }, [clocks, t, handleClockEditOpen, handleClockDelete]);

  // ===== manipulate Integers ===================================================

  const handleIntegerAddOpen = () => setIntegerAddOpen(true);
  const handleIntegerAddClose = () => setIntegerAddOpen(false);

  const handleIntegerEditOpen = useCallback(
    (id: number) => {
      setIntegerToEdit(integers[id]);
      setIntegerEditOpen(true);
    },
    [integers]
  );
  const handleIntegerEditClose = () => setIntegerEditOpen(false);

  const handleIntegerAdd = (name: string, size: string, min: string, max: string, init: string) => {
    addInteger(openedSystems, name, parseInt(size), parseInt(min), parseInt(max), parseInt(init));
    setIntegerAddOpen(false);
  };

  const handleIntegerEdit = (
    name: string,
    size: string,
    min: string,
    max: string,
    init: string,
    prevIntegerName?: string
  ) => {
    if (!prevIntegerName) {
      throw Error('handleIntegerEdit: prevIntegerName is empty or undefined');
    }
    editInteger(openedSystems, name, prevIntegerName, parseInt(size), parseInt(min), parseInt(max), parseInt(init));
    setIntegerEditOpen(false);
  };

  const handleIntegerDelete = useCallback(
    (id: number) => {
      const integerName = integers[id].name;
      removeInteger(openedSystems, integerName);
    },
    [integers, openedSystems, removeInteger]
  );

  const integerTable: JSX.Element = useMemo(() => {
    const integerRows = integers.map<ElementRowData>((int, index) => {
      const displayName =
        int.name +
        ', ' +
        'size:' +
        String(int.size) +
        ', ' +
        '[' +
        String(int.min) +
        ', ' +
        String(int.max) +
        ']' +
        ', ' +
        'init:' +
        String(int.init);
      const rowData: ElementRowData = { id: index, displayName: displayName };
      return rowData;
    });

    return (
      <ElementTable
        rows={integerRows}
        contentSingular={t('manipulation.table.integerSingular')}
        contentPlural={t('manipulation.table.integerPlural')}
        typeForTestId={'integer'}
        onAddOpen={handleIntegerAddOpen}
        onEditOpen={handleIntegerEditOpen}
        onDelete={handleIntegerDelete}
      />
    );
  }, [integers, t, handleIntegerEditOpen, handleIntegerDelete]);

  // ===== manipulate SyncConstraint ===================================================

  const handleSyncAddOpen = () => setSyncAddOpen(true);
  const handleSyncAddClose = () => setSyncAddOpen(false);

  const handleSyncEditOpen = useCallback(
    (id: number) => {
      setSyncToEdit(synchronizations[id]);
      setSyncEditOpen(true);
    },
    [synchronizations]
  );
  const handleSyncEditClose = () => setSyncEditOpen(false);

  const handleSyncAdd = (syncConstraint: SyncConstraint) => {
    addSync(openedSystems, syncConstraint.syncs);
    setSyncAddOpen(false);
  };

  const handleSyncEdit = (syncConstraint: SyncConstraint, prevSync?: SyncConstraint) => {
    if (!prevSync) {
      throw Error('handleSyncEdit: prevSyncId is empty or undefined');
    }
    editSync(openedSystems, syncConstraint.syncs, prevSync);
    setSyncEditOpen(false);
  };

  const handleSyncDelete = useCallback(
    (id: number) => {
      const syncToDelete = synchronizations[id];
      removeSync(openedSystems, syncToDelete);
    },
    [openedSystems, removeSync, synchronizations]
  );

  const syncTable: JSX.Element = useMemo(() => {
    const syncRows = synchronizations.map<ElementRowData>((syncConstraint, index) => ({
      id: index,
      displayName: formatSyncTable(syncConstraint.syncs),
    }));

    return (
      <ElementTable
        rows={syncRows}
        contentSingular={t('manipulation.table.syncSingular')}
        contentPlural={t('manipulation.table.syncPlural')}
        typeForTestId={'sync'}
        onAddOpen={handleSyncAddOpen}
        onEditOpen={handleSyncEditOpen}
        onDelete={handleSyncDelete}
      />
    );
  }, [formatSyncTable, handleSyncDelete, handleSyncEditOpen, synchronizations, t]);

  // ===========================================================================

  const allTables: JSX.Element[] = useMemo(() => {
    const tables = [locationTable, switchTable, clockTable, integerTable, syncTable];
    return tables.map((table, index) => (
      <div key={index} style={{ marginBottom: '16px' }}>
        {table}
      </div>
    ));
  }, [locationTable, switchTable, clockTable, integerTable, syncTable]);

  return (
    <>
      {allTables}
      <ManipulateLocationDialog
        open={locationAddOpen}
        locations={locations}
        clocks={clocks}
        handleClose={handleLocationAddClose}
        handleSubmit={handleLocationAdd}
        locPrevVersion={undefined}
      />
      <ManipulateLocationDialog
        open={locationEditOpen}
        locations={locations}
        clocks={clocks}
        handleClose={handleLocationEditClose}
        handleSubmit={handleLocationEdit}
        locPrevVersion={locationToEdit}
      />
      <ManipulateSwitchDialog
        open={switchAddOpen}
        locations={locations}
        switches={switches}
        clocks={clocks}
        handleClose={handleSwitchAddClose}
        handleSubmit={handleSwitchAdd}
        switchPrevVersion={undefined}
      />
      <ManipulateSwitchDialog
        open={switchEditOpen}
        locations={locations}
        switches={switches}
        clocks={clocks}
        handleClose={handleSwitchEditClose}
        handleSubmit={handleSwitchEdit}
        switchPrevVersion={switchToEdit}
      />
      <ManipulateClockDialog
        open={clockAddOpen}
        clocks={clocks}
        handleClose={handleClockAddClose}
        handleSubmit={handleClockAdd}
        prevClock={undefined}
      />
      <ManipulateClockDialog
        open={clockEditOpen}
        clocks={clocks}
        handleClose={handleClockEditClose}
        handleSubmit={handleClockEdit}
        prevClock={clockToEdit}
      />
      <ClockDeleteConfirmDialog
        clock={clockToDelete}
        open={clockDeleteConfirmOpen}
        onClose={handleClockDeleteClose}
        onDelete={deleteClock}
      />
      <ManipulateIntegerDialog
        open={integerAddOpen}
        integers={integers}
        handleClose={handleIntegerAddClose}
        handleSubmit={handleIntegerAdd}
        intPrevVersion={undefined}
      />
      <ManipulateIntegerDialog
        open={integerEditOpen}
        integers={integers}
        handleClose={handleIntegerEditClose}
        handleSubmit={handleIntegerEdit}
        intPrevVersion={integerToEdit}
      />
      <ManipulateSyncDialog
        open={syncAddOpen}
        synchronizations={synchronizations}
        processes={processes}
        handleClose={handleSyncAddClose}
        handleSubmit={handleSyncAdd}
        syncPrevVersion={undefined}
      />
      <ManipulateSyncDialog
        open={syncEditOpen}
        synchronizations={synchronizations}
        processes={processes}
        handleClose={handleSyncEditClose}
        handleSubmit={handleSyncEdit}
        syncPrevVersion={syncToEdit}
      />
    </>
  );
};
