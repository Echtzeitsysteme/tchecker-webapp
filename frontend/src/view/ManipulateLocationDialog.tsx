import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  MenuItem,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Clock } from '../model/ta/clock';
import { Location } from '../model/ta/location';
import { ClockComparator } from '../model/ta/clockComparator';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { Clause } from '../model/ta/clause';
import { ClausesManipulation } from './ClausesManipulation';
import { useTranslation } from 'react-i18next';
import { ClauseData } from '../viewmodel/ClausesViewModel';

interface ManipulateLocationDialogProps {
  open: boolean;
  locations: Location[];
  clocks: Clock[];
  locPrevVersion?: Location; // only for editing (not for adding)
  handleClose: () => void;
  handleSubmit: (
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    prevLocationName?: string // only for editing (not for adding)
  ) => void;
}

export const ManipulateLocationDialog: React.FC<ManipulateLocationDialogProps> = (props) => {
  const { open, locations, clocks, locPrevVersion, handleClose, handleSubmit } = props;
  const [t] = useTranslation();
  const [name, setName] = useState('');
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [initialLocationChecked, setInitialLocationChecked] = useState(false);
  const [invariantChecked, setInvariantChecked] = useState(false);
  const emptyClause: ClauseData = useMemo(
    () => ({
      id: Date.now(),
      clockValue: '',
      comparisonValue: '',
      numberInput: '0',
      isClockInvalid: true,
      isComparisonInvalid: true,
      isNumberInvalid: false,
    }),
    []
  );
  const [clauses, setClauses] = useState<ClauseData[]>([emptyClause]);

  // effect for setting initial values upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open) {
      return;
    }
    if (locPrevVersion !== undefined) {
      // load existing location if editing (for adding, "if" prevents entering this)
      setName(locPrevVersion.name);
      setInitialLocationChecked(!!locPrevVersion.isInitial);
      if (locPrevVersion.invariant) {
        setInvariantChecked(true);
        // don't just call Date.now() for every clause because generation is too fast
        let idCounter: number = Date.now();
        setClauses(
          locPrevVersion.invariant.clauses.map<ClauseData>((c) => {
            const clauseData: ClauseData = {
              id: idCounter++,
              clockValue: c.lhs.name,
              comparisonValue: c.op,
              numberInput: '' + c.rhs,
              isClockInvalid: false,
              isComparisonInvalid: false,
              isNumberInvalid: false,
            };
            return clauseData;
          })
        );
      } else {
        setInvariantChecked(false);
        setClauses([emptyClause]);
      }
    } else {
      setInitialLocationChecked(false);
      setInvariantChecked(false);
      setClauses([emptyClause]);
    }
  }, [open, locPrevVersion, emptyClause]);

  // effect to update validation checks
  useEffect(() => {
    // check validity of name field
    setIsNameEmpty(name.trim() === '');
    if (locPrevVersion) {
      // previous name is allowed
      const prevName = locPrevVersion.name;
      setIsNameDuplicate(
        locations.filter((loc) => loc.name !== prevName).some((loc) => loc.name.toLowerCase() === name.toLowerCase())
      );
    } else {
      setIsNameDuplicate(locations.some((loc) => loc.name.toLowerCase() === name.toLowerCase()));
    }
    isNameEmpty && setNameErrorMessage(t('locDialog.errorNameEmpty'));
    isNameDuplicate && setNameErrorMessage(t('locDialog.errorNameExists'));
  }, [name, locations, isNameEmpty, isNameDuplicate, locPrevVersion, t]);

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

  const handleAddClause = () => {
    setClauses([...clauses, { ...emptyClause, id: Date.now() }]);
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
    (id: number, field: keyof ClauseData, value: string) => {
      setClauses(
        clauses.map((row) => {
          if (row.id === id) {
            let updatedRow = { ...row, [field]: value };
            // Update validation flags based on the new value
            if (field === 'clockValue') {
              updatedRow.isClockInvalid = !value;
            }
            if (field === 'comparisonValue') {
              updatedRow.isComparisonInvalid = !value;
            }
            if (field === 'numberInput') {
              updatedRow.isNumberInvalid = !value;
            }
            // Update for number value if it changed
            if (field === 'numberInput' && value) {
              updatedRow = { ...updatedRow, [field]: '' + Math.max(0, parseInt(value, 10)) };
            }
            return updatedRow;
          }
          return row;
        })
      );
    },
    [clauses]
  );

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    const invariant: ClockConstraint | undefined = invariantChecked
      ? clauses
          .map<Clause>((c) => {
            const lhs: Clock = { name: c.clockValue };
            const op: ClockComparator | undefined = Object.values(ClockComparator).find(
              (value) => value === c.comparisonValue
            );
            if (op === undefined) {
              throw new Error(`Invalid comparison value: ${c.comparisonValue}`);
            }
            const rhs: number = parseInt(c.numberInput);
            const clause: Clause = { lhs, op, rhs };
            return clause;
          })
          .reduce<ClockConstraint>(
            (accumulator, current) => {
              accumulator.clauses.push(current);
              return accumulator;
            },
            { clauses: [] }
          )
      : undefined;
    if (locPrevVersion) {
      handleSubmit(name, initialLocationChecked, invariant, locPrevVersion.name);
      // value reset not needed for editing because values are loaded from existing version
    } else {
      handleSubmit(name, initialLocationChecked, invariant);
      // reset values for next opening of dialog
      setName('');
      setInvariantChecked(false);
      setClauses([emptyClause]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {locPrevVersion ? t('locDialog.editLoc') : t('locDialog.addLoc')}
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
          label={t('locDialog.name')}
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
          label={t('locDialog.isInitial')}
        />
        <FormControlLabel
          control={<Checkbox checked={invariantChecked} onChange={(e) => setInvariantChecked(e.target.checked)} />}
          label={t('locDialog.hasInvariant')}
        />
        {invariantChecked && (
          <ClausesManipulation
            clauses={clauses}
            clockDropdownItems={clockDropdownItems}
            comparisonDropdownItems={comparisonDropdownItems}
            handleClauseChange={handleClauseChange}
            handleDeleteClause={handleDeleteClause}
          />
        )}
        {invariantChecked && (
          <Button variant="outlined" onClick={handleAddClause} sx={{ marginTop: 2 }}>
            {t('locDialog.button.addClause')}
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="error">
          {t('locDialog.button.cancel')}
        </Button>
        <Button onClick={handleFormSubmit} variant="contained" disabled={isValidationError}>
          {locPrevVersion ? t('locDialog.button.edit') : t('locDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateLocationDialog;
