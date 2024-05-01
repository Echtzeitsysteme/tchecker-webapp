import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  MenuItem,
  FormControlLabel,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Divider,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Clock } from '../model/ta/clock';
import { Location } from '../model/ta/location';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { ClausesManipulation } from './ClausesManipulation';
import { useTranslation } from 'react-i18next';
import { useClausesViewModel } from '../viewmodel/ClausesViewModel';
import { useClockConstraintUtils } from '../utils/clockConstraintUtils';
import { Switch } from '../model/ta/switch';
import { useSwitchUtils } from '../utils/switchUtils';

interface ManipulateSwitchDialogProps {
  open: boolean;
  locations: Location[];
  switches: Switch[];
  clocks: Clock[];
  switchPrevVersion?: Switch; // only for editing (not for adding)
  handleClose: () => void;
  handleSubmit: (
    sourceName: string,
    action: string,
    resetNames: string[],
    targetName: string,
    guard?: ClockConstraint,
    prevSwitch?: Switch // only for editing (not for adding)
  ) => void;
}

export const ManipulateSwitchDialog: React.FC<ManipulateSwitchDialogProps> = (props) => {
  const { open, locations, switches, clocks, switchPrevVersion, handleClose, handleSubmit } = props;
  const clausesViewModel = useClausesViewModel();
  const { clauses, setClausesFromClockConstraint } = clausesViewModel;
  const { t } = useTranslation();
  const { transformToClockConstraint } = useClockConstraintUtils();
  const { switchesEqual } = useSwitchUtils();
  const [action, setAction] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [isActionEmpty, setActionEmpty] = useState<boolean>(false);
  const [isSourceEmpty, setSourceEmpty] = useState<boolean>(false);
  const [isTargetEmpty, setTargetEmpty] = useState<boolean>(false);
  const [resets, setResets] = useState<{ [key: string]: boolean }>(
    clocks.reduce(
      (acc, clock) => {
        acc[clock.name] = false; // Default all clocks to not reset
        return acc;
      },
      {} as { [key: string]: boolean }
    )
  );
  const [justOpened, setJustOpened] = useState(true);
  const [guardChecked, setGuardChecked] = useState(false);

  // effect for setting initial values upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open || !justOpened) {
      return;
    }
    if (switchPrevVersion !== undefined) {
      // load existing switch if editing (for adding, "if" prevents entering this)
      setAction(switchPrevVersion.actionLabel);
      // TODO: set source, target, reset
      if (switchPrevVersion.guard) {
        setGuardChecked(true);
        setClausesFromClockConstraint(clausesViewModel, switchPrevVersion.guard);
      } else {
        setGuardChecked(false);
        clausesViewModel.resetClauses(clausesViewModel);
      }
    } else {
      // when adding switch: set reset intially to none
      const initialResetClocks = clocks.reduce(
        (acc, clock) => {
          acc[clock.name] = false;
          return acc;
        },
        {} as { [key: string]: boolean }
      );
      setResets(initialResetClocks);
    }
    setJustOpened(false);
  }, [open, justOpened, clocks, switchPrevVersion, clausesViewModel, setClausesFromClockConstraint]);

  // update validation checks
  useEffect(() => {
    setActionEmpty(action.trim() === '');
    setSourceEmpty(source.trim() === '');
    setTargetEmpty(target.trim() === '');
  }, [action, source, target]);

  const isEqualToExistingSwitch = useMemo(() => {
    let existingSwitches: Switch[];
    if (switchPrevVersion) {
      existingSwitches = switches.filter((sw) => !switchesEqual(sw, switchPrevVersion));
    } else {
      existingSwitches = switches;
    }

    const sourceLoc: Location = { name: source, xCoordinate: 0, yCoordinate: 0 };
    const targetLoc: Location = { name: target, xCoordinate: 0, yCoordinate: 0 };
    const guard: ClockConstraint | undefined =
      guardChecked && clauses.length > 0 ? transformToClockConstraint(clauses) : undefined;
    const reset: Clock[] = clocks.filter((c) => resets[c.name]);
    const newSwitch: Switch = { source: sourceLoc, guard: guard, actionLabel: action, reset: reset, target: targetLoc };

    // Does switch already exist? Do not allow another switch being equal to an existing switch
    return existingSwitches.filter((sw) => switchesEqual(sw, newSwitch)).length > 0;
  }, [
    switchPrevVersion,
    switches,
    source,
    target,
    guardChecked,
    clauses,
    resets,
    action,
    clocks,
    transformToClockConstraint,
    switchesEqual,
  ]);

  const equalToExistingErrorMsg: JSX.Element | undefined = useMemo(() => {
    if (!isEqualToExistingSwitch) {
      return undefined;
    }
    return (
      <Typography variant="body2" color="error">
        {t('switchDialog.switchAlreadyExists')}
      </Typography>
    );
  }, [isEqualToExistingSwitch, t]);

  const isValidationError: boolean = useMemo(
    () =>
      isActionEmpty ||
      isSourceEmpty ||
      isTargetEmpty ||
      isEqualToExistingSwitch ||
      (guardChecked && clausesViewModel.isValidationError),
    [
      isActionEmpty,
      isSourceEmpty,
      isTargetEmpty,
      guardChecked,
      isEqualToExistingSwitch,
      clausesViewModel.isValidationError,
    ]
  );

  const handleResetClockChange = (clockName: string, isChecked: boolean) => {
    setResets((prev) => ({ ...prev, [clockName]: isChecked }));
  };

  const locationDropdownItems = useMemo(
    () =>
      locations.map((l) => (
        <MenuItem key={l.name} value={l.name}>
          {l.name}
        </MenuItem>
      )),
    [locations]
  );

  const handleCloseDialog = () => {
    // reset entries when dialog is closed
    setAction('');
    setSource('');
    setTarget('');
    clocks.forEach((c) => handleResetClockChange(c.name, false));
    setGuardChecked(false);
    clausesViewModel.resetClauses(clausesViewModel);
    setJustOpened(true); // for next opening of the dialog
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    const guard: ClockConstraint | undefined = guardChecked ? transformToClockConstraint(clauses) : undefined;
    const resetNames: string[] = clocks.filter((c) => resets[c.name]).map((c) => c.name);
    if (switchPrevVersion) {
      // TODO: handle submit
      // value reset not needed for editing because values are loaded from existing version
    } else {
      handleSubmit(source, action, resetNames, target, guard);
      // reset values for next opening of dialog
      setAction('');
      setSource('');
      setTarget('');
      clocks.forEach((c) => handleResetClockChange(c.name, false));
      setGuardChecked(false);
      clausesViewModel.resetClauses(clausesViewModel);
    }
    setJustOpened(true); // for next opening of dialog
  };

  const resetGrid: JSX.Element[] = useMemo(
    () =>
      clocks.map((clock) => (
        <Grid item xs={12} key={clock.name}>
          <FormControlLabel
            control={
              <Checkbox
                checked={resets[clock.name]}
                onChange={(e) => handleResetClockChange(clock.name, e.target.checked)}
              />
            }
            label={t('switchDialog.input.resetClock', { clockName: clock.name })}
          />
        </Grid>
      )),
    [clocks, resets, t]
  );

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        style: { minWidth: '450px' },
      }}
    >
      <DialogTitle>
        {switchPrevVersion ? t('switchDialog.title.editSwitch') : t('switchDialog.title.addSwitch')}
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
          label={t('switchDialog.input.action')}
          type="text"
          fullWidth
          variant="outlined"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          error={isActionEmpty}
          helperText={isActionEmpty ? t('switchDialog.error.action') : ''}
          style={{ marginBottom: '16px' }}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>{t('switchDialog.input.source')}</InputLabel>
              <Select value={source} onChange={(e) => setSource(e.target.value)} label="Source" error={isSourceEmpty}>
                {locationDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>{t('switchDialog.input.target')}</InputLabel>
              <Select value={target} onChange={(e) => setTarget(e.target.value)} label="Target" error={isTargetEmpty}>
                {locationDropdownItems}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <FormControlLabel
          control={<Checkbox checked={guardChecked} onChange={(e) => setGuardChecked(e.target.checked)} />}
          label={t('switchDialog.hasGuard')}
        />
        {guardChecked && <ClausesManipulation viewModel={clausesViewModel} clocks={clocks} />}
        {guardChecked && (
          <Button variant="outlined" onClick={() => clausesViewModel.addClause(clausesViewModel)} sx={{ marginTop: 2 }}>
            {t('switchDialog.button.addClause')}
          </Button>
        )}
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} alignItems="center">
          {resetGrid}
        </Grid>
        {equalToExistingErrorMsg}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="contained" color="error">
          {t('switchDialog.button.cancel')}
        </Button>
        <Button onClick={handleFormSubmit} variant="contained" disabled={isValidationError}>
          {switchPrevVersion ? t('switchDialog.button.edit') : t('switchDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateSwitchDialog;
