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
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Clock } from '../model/ta/clock';
import { Location } from '../model/ta/location';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClausesManipulation } from './ClausesManipulation';
import { useTranslation } from 'react-i18next';
import { useClausesViewModel } from '../viewmodel/ClausesViewModel';
import { useClockConstraintUtils } from '../utils/clockConstraintUtils';
import { useButtonUtils } from '../utils/buttonUtils';
import { FreeClausesManipulation } from './FreeClausesManipulation.tsx';
import { useFreeClausesViewModel } from '../viewmodel/FreeClausesViewModel.ts';
import { LabelsListManipulation } from './LabelsListManipulation.tsx';
import { useLabelsViewModel } from '../viewmodel/LabelsListViewModel.ts';
import { useLabelUtils } from '../utils/labelUtils.ts';

interface ManipulateLocationDialogProps {
  open: boolean;
  locations: Location[];
  clocks: Clock[];
  locPrevVersion?: Location; // only for editing (not for adding);
  handleClose: () => void;
  handleSubmit: (
    locationName: string,
    isInitial?: boolean,
    invariant?: ClockConstraint,
    committed?: boolean,
    urgent?: boolean,
    labels?: string[],
    prevLocationName?: string // only for editing (not for adding)
  ) => void;
}

export const ManipulateLocationDialog: React.FC<ManipulateLocationDialogProps> = (props) => {
  const { open, locations, clocks, locPrevVersion, handleClose, handleSubmit } = props;
  const clausesViewModel = useClausesViewModel();
  const { clauses, setClausesFromClockConstraint } = clausesViewModel;
  const freeClausesViewModel = useFreeClausesViewModel();
  const { freeClauses, setFreeClausesFromClockConstraint } = freeClausesViewModel;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();
  const { transformToClockConstraint } = useClockConstraintUtils();
  const { transformToLabelsList } = useLabelUtils();
  const [justOpened, setJustOpened] = useState(true);
  const [name, setName] = useState('');
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [initialLocationChecked, setInitialLocationChecked] = useState(false);
  const [invariantChecked, setInvariantChecked] = useState(false);
  const [committedChecked, setCommittedChecked] = useState(false);
  const [urgentChecked, setUrgentChecked] = useState(false);
  const labelsListViewModel = useLabelsViewModel();
  const { labels, setLabels } = labelsListViewModel;
  const [labelListChecked, setLabelListChecked] = useState(false);
  const [someLabelEmpty, setSomeLabelEmpty] = useState(false);
  const [someFreeClauseEmpty, setSomeFreeClauseEmpty] = useState(false);

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
        setFreeClausesFromClockConstraint(freeClausesViewModel, locPrevVersion.invariant);
      } else {
        setInvariantChecked(false);
        clausesViewModel.resetClauses(clausesViewModel);
      }
      if (locPrevVersion.labels) {
        setLabelListChecked(true);
        setLabels(labelsListViewModel, locPrevVersion.labels);
      } else {
        setLabelListChecked(false);
        labelsListViewModel.resetLabels(labelsListViewModel);
      }
      setCommittedChecked(!!locPrevVersion.committed);
      setUrgentChecked(!!locPrevVersion.urgent);
    }
    setJustOpened(false);
  }, [
    open,
    justOpened,
    locPrevVersion,
    clausesViewModel,
    setClausesFromClockConstraint,
    setFreeClausesFromClockConstraint,
    freeClausesViewModel,
    labelsListViewModel,
    setLabels,
  ]);

  // effect to update validation checks
  useEffect(() => {
    // check validity of name field
    setSomeFreeClauseEmpty(freeClauses.some((clause) => clause.term.trim().length === 0));
    setSomeLabelEmpty(labels.some((label) => label.term.trim().length === 0));
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
  }, [name, locations, isNameEmpty, isNameDuplicate, locPrevVersion, t, freeClauses, someFreeClauseEmpty, labels]);

  const isValidationError: boolean = useMemo(
    () =>
      isNameEmpty ||
      isNameDuplicate ||
      (invariantChecked && clausesViewModel.isValidationError) ||
      (invariantChecked && someFreeClauseEmpty) ||
      (labelListChecked && someLabelEmpty) ||
      (committedChecked && urgentChecked),
    [
      isNameEmpty,
      isNameDuplicate,
      invariantChecked,
      clausesViewModel.isValidationError,
      someFreeClauseEmpty,
      labelListChecked,
      someLabelEmpty,
      committedChecked,
      urgentChecked,
    ]
  );

  const handleCloseDialog = () => {
    // reset entries when dialog is closed
    setName('');
    setInvariantChecked(false);
    clausesViewModel.resetClauses(clausesViewModel);
    freeClausesViewModel.resetFreeClauses(freeClausesViewModel);
    setUrgentChecked(false);
    setCommittedChecked(false);
    setLabelListChecked(false);
    labelsListViewModel.resetLabels(labelsListViewModel);
    setJustOpened(true); // for next opening of the dialog
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    const invariant: ClockConstraint | undefined = invariantChecked
      ? transformToClockConstraint(clauses, freeClauses)
      : undefined;
    const labelsList: string[] | undefined = labelListChecked ? transformToLabelsList(labels) : undefined;
    if (locPrevVersion) {
      handleSubmit(
        name.trim(),
        initialLocationChecked,
        invariant,
        committedChecked,
        urgentChecked,
        labelsList,
        locPrevVersion.name
      );
      // value reset not needed for editing because values are loaded from existing version
    } else {
      handleSubmit(name.trim(), initialLocationChecked, invariant, committedChecked, urgentChecked, labelsList);
      // reset values for next opening of dialog
      setName('');
      setInvariantChecked(false);
      clausesViewModel.resetClauses(clausesViewModel);
      freeClausesViewModel.resetFreeClauses(freeClausesViewModel);
      setLabelListChecked(false);
      labelsListViewModel.resetLabels(labelsListViewModel);
    }
    setJustOpened(true); // for next opening of dialog
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>
        {locPrevVersion ? t('locDialog.editLoc') : t('locDialog.addLoc')}
        <IconButton
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
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
          data-testid={'input-location-name'}
        />
        <FormControlLabel
          control={
            <Checkbox checked={initialLocationChecked} onChange={(e) => setInitialLocationChecked(e.target.checked)} />
          }
          label={t('locDialog.isInitial')}
          data-testid={'checkbox-location-isInitial'}
        />
        <FormControlLabel
          control={<Checkbox checked={invariantChecked} onChange={(e) => setInvariantChecked(e.target.checked)} />}
          label={t('locDialog.hasInvariant')}
          data-testid={'checkbox-location-hasInvariant'}
        />
        {invariantChecked && <ClausesManipulation viewModel={clausesViewModel} clocks={clocks} />}
        {invariantChecked && <FreeClausesManipulation viewModel={freeClausesViewModel} />}
        {invariantChecked && (
          <Button
            variant="outlined"
            onMouseDown={() => clausesViewModel.addClause(clausesViewModel)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => clausesViewModel.addClause(clausesViewModel))}
            sx={{ marginTop: 2 }}
            data-testid={'button-add-clause'}
          >
            {t('clauses.button.addClause')}
          </Button>
        )}
        {invariantChecked && (
          <Button
            variant="outlined"
            onMouseDown={() => freeClausesViewModel.addFreeClause(freeClausesViewModel)}
            onKeyDown={(e) =>
              executeOnKeyboardClick(e.key, () => freeClausesViewModel.addFreeClause(freeClausesViewModel))
            }
            sx={{ marginTop: 2, marginLeft: 1 }}
            data-testid={'button-add-freeInvariant'}
          >
            {t('freeClauses.button.addFreeClause')}
          </Button>
        )}
        <Divider sx={{ my: 1 }} />
        <FormControlLabel
          control={<Checkbox checked={committedChecked} onChange={(e) => setCommittedChecked(e.target.checked)} />}
          label={t('locDialog.isCommitted')}
          data-testid={'checkbox-location-isCommitted'}
        />
        <FormControlLabel
          control={<Checkbox checked={urgentChecked} onChange={(e) => setUrgentChecked(e.target.checked)} />}
          label={t('locDialog.isUrgent')}
          data-testid={'checkbox-location-isUrgent'}
        />
        <FormControlLabel
          control={<Checkbox checked={labelListChecked} onChange={(e) => setLabelListChecked(e.target.checked)} />}
          label={t('locDialog.hasLabels')}
          data-testid={'checkbox-location-hasLabels'}
        />
        {labelListChecked && <LabelsListManipulation viewModel={labelsListViewModel} />}
        {labelListChecked && (
          <Button
            variant="outlined"
            onMouseDown={() => labelsListViewModel.addLabel(labelsListViewModel)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => labelsListViewModel.addLabel(labelsListViewModel))}
            sx={{ marginTop: 2, marginLeft: 1 }}
            data-testid={'button-add-label'}
          >
            {t('locDialog.button.addLabel')}
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
          variant="contained"
          color="error"
        >
          {t('locDialog.button.cancel')}
        </Button>
        <Button
          onMouseDown={handleFormSubmit}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isValidationError}
          data-testid={'button-add-location-ok'}
        >
          {locPrevVersion ? t('locDialog.button.edit') : t('locDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateLocationDialog;
