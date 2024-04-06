import React, { useMemo, useState } from 'react';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { Button, TextField } from '@mui/material';
import ElementTable, { ElementRowData } from './ElementTable';
import { useTranslation } from 'react-i18next';
import { useFormattingUtils } from '../utils/formattingUtils';
import AddLocationDialog from './AddLocationDialog';
import { ClockConstraint } from '../model/ta/clockConstraint';

interface ManipulationProps {
  viewModel: AnalysisViewModel;
}

export const AutomatonManipulation: React.FC<ManipulationProps> = (props) => {
  const { viewModel } = props;
  const { ta, addLocation } = viewModel;
  const { locations, switches, clocks } = ta;
  const { t } = useTranslation();
  const { formatSwitchTable } = useFormattingUtils();
  const [locationAddOpen, setlocationAddOpen] = useState(false);

  const handleLocationAddOpen = () => setlocationAddOpen(true);
  const handleLocationAddClose = () => setlocationAddOpen(false);

  const handleLocationAdd = (locationName: string, isInitial?: boolean, invariant?: ClockConstraint) => {
    addLocation(viewModel, locationName, isInitial, invariant);
    setlocationAddOpen(false);
  };

  const handleLocationEdit = (id: number) => {
    // TODO implement the edit logic
    console.log('Editing location with id', id); // TODO delete
  };

  const handleLocationDelete = (id: number) => {
    // TODO implement the delete logic
    console.log('Deleting location with id', id); // TODO delete
  };

  const locationTable: JSX.Element = useMemo(() => {
    const locationRows = locations.map((loc, index) => ({ id: index, displayName: loc.name }));
    return (
      <ElementTable
        rows={locationRows}
        contentSingular={t('manipulation.table.locSingular')}
        contentPlural={t('manipulation.table.locPlural')}
        onAdd={handleLocationAddOpen}
        onEdit={handleLocationEdit}
        onDelete={handleLocationDelete}
      />
    );
  }, [locations, t]);

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
        contentSingular={t('manipulation.table.switchSingular')}
        contentPlural={t('manipulation.table.switchPlural')}
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
        contentSingular={t('manipulation.table.clockSingular')}
        contentPlural={t('manipulation.table.clockPlural')}
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
      <AddLocationDialog
        open={locationAddOpen}
        locations={locations}
        clocks={clocks}
        handleClose={handleLocationAddClose}
        handleSubmit={handleLocationAdd}
      />

      <Button variant="contained">Button 1</Button>
      <TextField label="Input 1" variant="outlined" />

      <Button variant="contained">Large Button!!! 1</Button>
      <Button variant="contained">Large Button!!! 2</Button>
      <Button variant="contained">Large Button!!! 3</Button>
      <Button variant="contained">Large Button!!! 4</Button>
      <Button variant="contained">Large Button!!! 5</Button>
      <Button variant="contained">Large Button!!! 6</Button>
      <Button variant="contained">Large Button!!! 7</Button>
      <Button variant="contained">Large Button!!! 8</Button>
      <Button variant="contained">Large Button!!! 9</Button>
      <Button variant="contained">Large Button!!! 10</Button>
      <Button variant="contained">Large Button!!! 11</Button>
      <Button variant="contained">Large Button!!! 12</Button>
      <Button variant="contained">Large Button!!! 13</Button>
      <Button variant="contained">Large Button!!! 14</Button>
      <Button variant="contained">Large Button!!! 15</Button>
      <Button variant="contained">Large Button!!! 16</Button>
      <Button variant="contained">Large Button!!! 17</Button>
      <Button variant="contained">Large Button!!! 18</Button>
      <Button variant="contained">Large Button!!! 19</Button>
      <Button variant="contained">Large Button!!! 20</Button>
      <Button variant="contained">Large Button!!! 11</Button>
      <Button variant="contained">Large Button!!! 12</Button>
      <Button variant="contained">Large Button!!! 13</Button>
      <Button variant="contained">Large Button!!! 14</Button>
      <Button variant="contained">Large Button!!! 15</Button>
      <Button variant="contained">Large Button!!! 16</Button>
      <Button variant="contained">Large Button!!! 17</Button>
      <Button variant="contained">Large Button!!! 18</Button>
      <Button variant="contained">Large Button!!! 19</Button>
      <Button variant="contained">Large Button!!! 20</Button>
    </>
  );
};
