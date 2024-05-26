import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Clock } from '../model/ta/clock';
import { Location } from '../model/ta/location';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClausesManipulation } from './ClausesManipulation';
import { useTranslation } from 'react-i18next';
import { useClausesViewModel } from '../viewmodel/ClausesViewModel';
import { useClockConstraintUtils } from '../utils/clockConstraintUtils';

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
  const clausesViewModel = useClausesViewModel();
  const { clauses, setClausesFromClockConstraint } = clausesViewModel;
  const { t } = useTranslation();
  const { transformToClockConstraint } = useClockConstraintUtils();
  const [justOpened, setJustOpened] = useState(true);
  const [name, setName] = useState('');
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [initialLocationChecked, setInitialLocationChecked] = useState(false);
  const [invariantChecked, setInvariantChecked] = useState(false);

  // effect for setting initial values upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open || !justOpened) {
      return;
    }
    if (locPrevVersion !== undefined) {
      // load existing location if editing (for adding, "if" prevents entering this)
      setName(locPrevVersion.name);
      setInitialLocationChecked(!!locPrevVersion.isInitial);
      if (locPrevVersion.invariant) {
        setInvariantChecked(true);
        setClausesFromClockConstraint(clausesViewModel, locPrevVersion.invariant);
      } else {
        setInvariantChecked(false);
        clausesViewModel.resetClauses(clausesViewModel);
      }
    }
    setJustOpened(false);
  }, [open, justOpened, locPrevVersion, clausesViewModel, setClausesFromClockConstraint]);

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
    () => isNameEmpty || isNameDuplicate || (invariantChecked && clausesViewModel.isValidationError),
    [isNameEmpty, isNameDuplicate, invariantChecked, clausesViewModel.isValidationError]
  );

  const handleCloseDialog = () => {
    // reset entries when dialog is closed
    setName('');
    setInvariantChecked(false);
    clausesViewModel.resetClauses(clausesViewModel);
    setJustOpened(true); // for next opening of the dialog
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    const invariant: ClockConstraint | undefined = invariantChecked ? transformToClockConstraint(clauses) : undefined;
    if (locPrevVersion) {
      handleSubmit(name, initialLocationChecked, invariant, locPrevVersion.name);
      // value reset not needed for editing because values are loaded from existing version
    } else {
      handleSubmit(name, initialLocationChecked, invariant);
      // reset values for next opening of dialog
      setName('');
      setInvariantChecked(false);
      clausesViewModel.resetClauses(clausesViewModel);
    }
    setJustOpened(true); // for next opening of dialog
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>
        {locPrevVersion ? t('locDialog.editLoc') : t('locDialog.addLoc')}
        <IconButton
          onClick={handleCloseDialog}
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
        {invariantChecked && <ClausesManipulation viewModel={clausesViewModel} clocks={clocks} />}
        {invariantChecked && (
          <Button variant="outlined" onClick={() => clausesViewModel.addClause(clausesViewModel)} sx={{ marginTop: 2 }}>
            {t('locDialog.button.addClause')}
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="contained" color="error">
          {t('locDialog.button.cancel')}
        </Button>
        <Button onClick={handleFormSubmit} variant="contained" color="primary" disabled={isValidationError}>
          {locPrevVersion ? t('locDialog.button.edit') : t('locDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateLocationDialog;
