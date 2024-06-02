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

interface ManipulationProps {
  viewModel: AnalysisViewModel;
}

export const AutomatonManipulation: React.FC<ManipulationProps> = (props) => {
  const { viewModel } = props;
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
  const { t } = useTranslation();
  const { formatSwitchTable } = useFormattingUtils();
  const { taUsesClockInAnyConstraint } = useClockConstraintUtils();

  const [locationAddOpen, setLocationAddOpen] = useState(false);
  const [locationEditOpen, setLocationEditOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | undefined>(undefined);
  const [switchAddOpen, setSwitchAddOpen] = useState(false);
  const [switchEditOpen, setSwitchEditOpen] = useState(false);
  const [switchToEdit, setSwitchToEdit] = useState<Switch | undefined>(undefined);
  const [clockAddOpen, setClockAddOpen] = useState(false);
  const [clockEditOpen, setClockEditOpen] = useState(false);
  const [clockNameToEdit, setClockNameToEdit] = useState<string | undefined>(undefined);
  const [clockDeleteConfirmOpen, setClockDeleteConfirmOpen] = useState(false);
  const [clockToDelete, setClockToDelete] = useState<Clock | undefined>(undefined);

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

  const handleLocationAdd = (locationName: string, isInitial?: boolean, invariant?: ClockConstraint) => {
    addLocation(viewModel, locationName, isInitial, invariant);
    setLocationAddOpen(false);
  };

  const handleLocationEdit = (
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    prevLocationName?: string
  ) => {
    if (!prevLocationName) {
      throw Error('handleLocationEdit: prevLocationName is empty or undefined');
    }
    editLocation(viewModel, locationName, prevLocationName, isInitial, invariant);
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
              <Home fontSize="small" />
            </Tooltip>
            <Typography variant="body1" style={{ marginLeft: 4 }}>
              {loc.name}
            </Typography>
          </div>
        );
      } else {
        displayName = loc.name;
      }
      const rowData: ElementRowData = { id: index, displayName: displayName };
      return rowData;
    });
    return (
      <ElementTable
        rows={locationRows}
        contentSingular={t('manipulation.table.locSingular')}
        contentPlural={t('manipulation.table.locPlural')}
        onAddOpen={handleLocationAddOpen}
        onEditOpen={handleLocationEditOpen}
        onDelete={handleLocationDelete}
      />
    );
  }, [locations, t, handleLocationEditOpen, handleLocationDelete]);

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
    guard?: ClockConstraint
  ) => {
    addSwitch(viewModel, sourceName, action, resetNames, targetName, guard);
    setSwitchAddOpen(false);
  };

  const handleSwitchEdit = (
    sourceName: string,
    action: string,
    resetNames: string[],
    targetName: string,
    guard?: ClockConstraint,
    prevSwitch?: Switch
  ) => {
    if (!prevSwitch) {
      throw Error('handleSwitchEdit: prevSwitch is null or undefined');
    }
    editSwitch(viewModel, prevSwitch, sourceName, action, resetNames, targetName, guard);
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
      setClockNameToEdit(clocks[id].name);
      setClockEditOpen(true);
    },
    [clocks]
  );
  const handleClockEditClose = () => setClockEditOpen(false);

  const handleClockAdd = (clockName: string) => {
    addClock(viewModel, clockName);
    setClockAddOpen(false);
  };

  const handleClockEdit = (clockName: string, prevClockName?: string) => {
    if (!prevClockName) {
      throw Error('handleClockEdit: prevClockName is null or undefined or empty');
    }
    editClock(viewModel, clockName, prevClockName);
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
    const clockRows = clocks.map((clock, index) => ({ id: index, displayName: clock.name }));
    return (
      <ElementTable
        rows={clockRows}
        contentSingular={t('manipulation.table.clockSingular')}
        contentPlural={t('manipulation.table.clockPlural')}
        onAddOpen={handleClockAddOpen}
        onEditOpen={handleClockEditOpen}
        onDelete={handleClockDelete}
      />
    );
  }, [clocks, t, handleClockEditOpen, handleClockDelete]);

  // ===========================================================================

  const allTables: JSX.Element[] = useMemo(() => {
    const tables = [locationTable, switchTable, clockTable];
    return tables.map((table, index) => (
      <div key={index} style={{ marginBottom: '16px' }}>
        {table}
      </div>
    ));
  }, [locationTable, switchTable, clockTable]);

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
        prevClockName={undefined}
      />
      <ManipulateClockDialog
        open={clockEditOpen}
        clocks={clocks}
        handleClose={handleClockEditClose}
        handleSubmit={handleClockEdit}
        prevClockName={clockNameToEdit}
      />
      <ClockDeleteConfirmDialog
        clock={clockToDelete}
        open={clockDeleteConfirmOpen}
        onClose={handleClockDeleteClose}
        onDelete={deleteClock}
      />
    </>
  );
};
