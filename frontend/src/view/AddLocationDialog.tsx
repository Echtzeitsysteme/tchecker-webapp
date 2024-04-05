import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Clock } from '../model/ta/clock';
import { Location } from '../model/ta/location';
import { ClockComparator } from '../model/ta/clockComparator';

export interface AddLocationDialogProps {
  open: boolean;
  locations: Location[];
  clocks: Clock[];
  handleClose: () => void;
  handleSubmit: () => void;
}

export interface ClauseData {
  id: number;
  clockValue: string;
  comparisonValue: string;
  numberInput: number;
  isClockInvalid: boolean;
  isComparisonInvalid: boolean;
  isNumberInvalid: boolean;
}

export const AddLocationDialog: React.FC<AddLocationDialogProps> = (props) => {
  const { open, locations, clocks, handleClose, handleSubmit } = props;
  const [name, setName] = useState('');
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [initialLocationChecked, setInitialLocationChecked] = useState(false);
  const [invariantChecked, setInvariantChecked] = useState(false);
  const emptyClause = {
    id: Date.now(),
    clockValue: '',
    comparisonValue: '',
    numberInput: 0,
    isClockInvalid: true,
    isComparisonInvalid: true,
    isNumberInvalid: false,
  };
  const [clauses, setClauses] = useState<ClauseData[]>([emptyClause]);

  const handleAddClause = () => {
    setClauses([...clauses, emptyClause]);
  };

  const handleDeleteClause = useCallback(
    (id: number) => {
      if (clauses.length > 1) {
        setClauses(clauses.filter((row) => row.id !== id));
      }
    },
    [clauses]
  );

  const handleClauseChange = useCallback(
    (id: number, field: keyof ClauseData, value: string | number) => {
      setClauses(
        clauses.map((row) => {
          if (row.id === id) {
            const updatedRow = { ...row, [field]: value };
            // Update validation flags based on the new value
            if (field === 'clockValue') {
              updatedRow.isClockInvalid = !value;
            }
            if (field === 'comparisonValue') {
              updatedRow.isComparisonInvalid = !value;
            }
            if (field === 'numberInput') {
              updatedRow.isNumberInvalid = !(typeof value === 'number' && value >= 0);
            }
            return updatedRow;
          }
          return row;
        })
      );
    },
    [clauses]
  );

  useEffect(() => {
    setIsNameEmpty(name.trim() === '');
    setIsNameDuplicate(locations.some((loc) => loc.name.toLowerCase() === name.toLowerCase()));
    isNameEmpty && setNameErrorMessage('Name cannot be empty');
    isNameDuplicate && setNameErrorMessage('Name already exists');
  }, [name, locations, isNameEmpty, isNameDuplicate]);

  const isValidationError: boolean = useMemo(
    () =>
      isNameEmpty ||
      isNameDuplicate ||
      (invariantChecked &&
        clauses
          .map((c) => c.isClockInvalid || c.isComparisonInvalid || c.isNumberInvalid)
          .reduce((result, current) => result || current, false)),
    [isNameEmpty, isNameDuplicate, invariantChecked, clauses]
  );

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    handleSubmit(); // TODO adjust what is submitted
    setName('');
    setInvariantChecked(false);
    setClauses([emptyClause]);
  };

  const clockDropdownItems = useMemo(
    () =>
      clocks.map((c) => (
        <MenuItem key={c.name} value={c.name}>
          {c.name}
        </MenuItem>
      )),
    [clocks]
  );

  const comparisonDropdownItems = useMemo(
    () =>
      Object.values(ClockComparator).map((v) => (
        <MenuItem key={v} value={v}>
          {v}
        </MenuItem>
      )),
    []
  );

  const clauseRows: JSX.Element[] = useMemo(
    () =>
      clauses.map((row) => (
        <Grid key={row.id} container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <IconButton disabled={clauses.length <= 1} onClick={() => handleDeleteClause(row.id)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Clock</InputLabel>
              <Select
                value={row.clockValue}
                label="Clock"
                onChange={(e) => handleClauseChange(row.id, 'clockValue', e.target.value)}
                error={row.isClockInvalid}
              >
                {clockDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Comparison</InputLabel>
              <Select
                value={row.comparisonValue}
                label="Comparison"
                onChange={(e) => handleClauseChange(row.id, 'comparisonValue', e.target.value)}
                error={row.isComparisonInvalid}
              >
                {comparisonDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              margin="dense"
              label="Value"
              type="number"
              fullWidth
              variant="outlined"
              value={row.numberInput}
              onChange={(e) => handleClauseChange(row.id, 'numberInput', Math.max(0, parseInt(e.target.value, 10)))}
              InputProps={{ inputProps: { min: 0 } }}
              error={row.isNumberInvalid}
            />
          </Grid>
        </Grid>
      )),
    [clauses, clockDropdownItems, comparisonDropdownItems, handleClauseChange, handleDeleteClause]
  );

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Add Location
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={isNameEmpty || isNameDuplicate}
          helperText={isNameEmpty || isNameDuplicate ? nameErrorMessage : ''}
        />
        <FormControlLabel
          control={
            <Checkbox checked={initialLocationChecked} onChange={(e) => setInitialLocationChecked(e.target.checked)} />
          }
          label="Initial Location"
        />
        <FormControlLabel
          control={<Checkbox checked={invariantChecked} onChange={(e) => setInvariantChecked(e.target.checked)} />}
          label="Add Invariant"
        />
        {invariantChecked && clauseRows}
        {invariantChecked && (
          <Button variant="outlined" onClick={handleAddClause} sx={{ marginTop: 2 }}>
            Add Clause
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="error">
          Cancel
        </Button>
        <Button onClick={handleFormSubmit} variant="contained" disabled={isValidationError}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLocationDialog;
