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

interface ManipulationProps {
  viewModel: AnalysisViewModel;
}

export const AutomatonManipulation: React.FC<ManipulationProps> = (props) => {
  const { viewModel } = props;
  const { ta, addLocation, editLocation, removeLocation } = viewModel;
  const { locations, switches, clocks } = ta;
  const { t } = useTranslation('automaton-manipulation');
  const { formatSwitchTable } = useFormattingUtils();
  const [locationAddOpen, setlocationAddOpen] = useState(false);
  const [locationEditOpen, setlocationEditOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | undefined>(undefined);

  const handleLocationAddOpen = () => setlocationAddOpen(true);
  const handleLocationAddClose = () => setlocationAddOpen(false);
  const handleLocationEditOpen = useCallback(
    (id: number) => {
      setLocationToEdit(locations[id]);
      setlocationEditOpen(true);
    },
    [locations]
  );
  const handleLocationEditClose = () => setlocationEditOpen(false);

  const handleLocationAdd = (locationName: string, isInitial?: boolean, invariant?: ClockConstraint) => {
    addLocation(viewModel, locationName, isInitial, invariant);
    setlocationAddOpen(false);
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
    setlocationEditOpen(false);
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
            <Tooltip title={t('initLocLabel')}>
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
        contentSingular={t('locSingular')}
        contentPlural={t('locPlural')}
        onAdd={handleLocationAddOpen}
        onEdit={handleLocationEditOpen}
        onDelete={handleLocationDelete}
      />
    );
  }, [locations, t, handleLocationEditOpen, handleLocationDelete]);

  const handleSwitchAdd = () => {
    // TODO implement the add logic
    console.log('Add switch'); // TODO delete
  };

  const handleSwitchEdit = (id: number) => {
    // TODO implement the edit logic
    console.log('Editing switch with id', id); // TODO delete
  };

  const handleSwitchDelete = (id: number) => {
    // TODO implement the delete logic
    console.log('Deleting switch with id', id); // TODO delete
  };

  const switchTable: JSX.Element = useMemo(() => {
    const switchRows: ElementRowData[] = switches.map((sw, index) => ({
      id: index,
      displayName: formatSwitchTable(sw),
    }));
    return (
      <ElementTable
        rows={switchRows}
        contentSingular={t('switchSingular')}
        contentPlural={t('switchPlural')}
        onAdd={handleSwitchAdd}
        onEdit={handleSwitchEdit}
        onDelete={handleSwitchDelete}
      />
    );
  }, [switches, t, formatSwitchTable]);

  const handleClockAdd = () => {
    // TODO implement the add logic
    console.log('Add clock'); // TODO delete
  };

  const handleClockEdit = (id: number) => {
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
        contentSingular={t('clockSingular')}
        contentPlural={t('clockPlural')}
        onAdd={handleClockAdd}
        onEdit={handleClockEdit}
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
    </>
  );
};
