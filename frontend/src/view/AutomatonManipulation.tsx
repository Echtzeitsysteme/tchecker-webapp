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

interface ManipulationProps {
  viewModel: AnalysisViewModel;
}

export const AutomatonManipulation: React.FC<ManipulationProps> = (props) => {
  const { viewModel } = props;
  const { ta, addLocation, editLocation, removeLocation, addSwitch, removeSwitch } = viewModel;
  const { locations, switches, clocks } = ta;
  const { t } = useTranslation();
  const { formatSwitchTable } = useFormattingUtils();
  const [locationAddOpen, setLocationAddOpen] = useState(false);
  const [locationEditOpen, setLocationEditOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | undefined>(undefined);
  const [switchAddOpen, setSwitchAddOpen] = useState(false);

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

  const handleSwitchAddOpen = () => setSwitchAddOpen(true);
  const handleSwitchAddClose = () => setSwitchAddOpen(false);

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

  const handleSwitchEditOpen = (id: number) => {
    // TODO implement the edit logic
    console.log('Editing switch with id', id); // TODO delete
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
  }, [switches, t, formatSwitchTable, handleSwitchDelete]);

  const handleClockAddOpen = () => {
    // TODO implement the add logic
    console.log('Add clock'); // TODO delete
  };

  const handleClockEditOpen = (id: number) => {
    // TODO implement the edit logic
    console.log('Editing clock with id', id); // TODO delete
  };

  const handleClockDelete = (id: number) => {
    // TODO implement the delete logic
    console.log('Deleting clock with id', id); // TODO delete
  };

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
  }, [clocks, t]);

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
    </>
  );
};
