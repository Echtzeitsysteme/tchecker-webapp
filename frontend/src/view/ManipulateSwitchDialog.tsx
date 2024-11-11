import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useButtonUtils } from '../utils/buttonUtils';
import { useFreeClausesViewModel } from '../viewmodel/FreeClausesViewModel.ts';
import { FreeClausesManipulation } from './FreeClausesManipulation.tsx';
import { useStatementsViewModel } from '../viewmodel/StatementsViewModel.ts';
import { StatementManipulation } from './StatementManipulation.tsx';
import { SwitchStatement } from '../model/ta/switchStatement.ts';

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
    statement?: SwitchStatement,
    prevSwitch?: Switch // only for editing (not for adding)
  ) => void;
}

export const ManipulateSwitchDialog: React.FC<ManipulateSwitchDialogProps> = (props) => {
  const { open, locations, switches, clocks, switchPrevVersion, handleClose, handleSubmit } = props;
  const clausesViewModel = useClausesViewModel();
  const { clauses, setClausesFromClockConstraint } = clausesViewModel;
  const freeClausesViewModel = useFreeClausesViewModel();
  const { freeClauses, setFreeClausesFromClockConstraint } = freeClausesViewModel;
  const statementsViewModel = useStatementsViewModel();
  const { statements, setStatement } = statementsViewModel;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();
  const { transformToClockConstraint } = useClockConstraintUtils();
  const { transformToSwitchStatement, switchesEqual } = useSwitchUtils();
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
  const [statementChecked, setStatementChecked] = useState(false);
  const [someFreeClauseEmpty, setSomeFreeClauseEmpty] = useState(false);
  const [someStatementEmpty, setSomeStatementEmpty] = useState(false);

  const setResetsFromClockArray = useCallback(
    (clocksToReset: Clock[]) => {
      const resetNames = clocksToReset.map((c) => c.name);
      const updatedResetClocks = clocks.reduce(
        (acc, clock) => {
          acc[clock.name] = resetNames.includes(clock.name);
          return acc;
        },
        {} as { [key: string]: boolean }
      );
      setResets(updatedResetClocks);
    },
    [clocks]
  );

  // effect for setting initial values upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open || !justOpened) {
      return;
    }
    if (switchPrevVersion !== undefined) {
      // load existing switch if editing (for adding, "if" prevents entering this)
      setAction(switchPrevVersion.actionLabel);
      setSource(switchPrevVersion.source.name);
      setTarget(switchPrevVersion.target.name);
      setResetsFromClockArray(switchPrevVersion.reset);
      if (switchPrevVersion.guard) {
        setGuardChecked(true);
        setClausesFromClockConstraint(clausesViewModel, switchPrevVersion.guard);
        setFreeClausesFromClockConstraint(freeClausesViewModel, switchPrevVersion.guard);
      } else {
        setGuardChecked(false);
        clausesViewModel.resetClauses(clausesViewModel);
        freeClausesViewModel.resetFreeClauses(freeClausesViewModel);
      }
      if (switchPrevVersion.statement) {
        setStatementChecked(true);
        setStatement(statementsViewModel, switchPrevVersion.statement);
      } else {
        setStatementChecked(false);
        statementsViewModel.resetStatements(statementsViewModel);
      }
    } else {
      // when adding switch: set reset intially to none
      setResetsFromClockArray([]);
    }
    setJustOpened(false);
  }, [
    open,
    justOpened,
    clocks,
    switchPrevVersion,
    clausesViewModel,
    setClausesFromClockConstraint,
    setResetsFromClockArray,
    setFreeClausesFromClockConstraint,
    freeClausesViewModel,
    setStatement,
    statementsViewModel,
  ]);

  // update validation checks
  useEffect(() => {
    setActionEmpty(action.trim() === '');
    setSourceEmpty(source.trim() === '');
    setTargetEmpty(target.trim() === '');
    setSomeFreeClauseEmpty(freeClauses.some((clause) => clause.term.trim().length === 0));
    setSomeStatementEmpty(statements.some((stmt) => stmt.term.trim().length === 0));
  }, [action, freeClauses, source, statements, target]);

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
      guardChecked && (clauses.length > 0 || freeClauses.length > 0)
        ? transformToClockConstraint(clauses, freeClauses)
        : undefined;
    const reset: Clock[] = clocks.filter((c) => resets[c.name]);
    const statement: SwitchStatement | undefined =
      statementChecked && statements.length > 0 ? transformToSwitchStatement(statements) : undefined;
    const newSwitch: Switch = {
      source: sourceLoc,
      guard: guard,
      actionLabel: action,
      reset: reset,
      statement: statement,
      target: targetLoc,
    };

    // Does switch already exist? Do not allow another switch being equal to an existing switch
    return existingSwitches.filter((sw) => switchesEqual(sw, newSwitch)).length > 0;
  }, [
    switchPrevVersion,
    source,
    target,
    guardChecked,
    clauses,
    freeClauses,
    transformToClockConstraint,
    clocks,
    statementChecked,
    statements,
    transformToSwitchStatement,
    action,
    switches,
    switchesEqual,
    resets,
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
      (guardChecked && clausesViewModel.isValidationError) ||
      (guardChecked && someFreeClauseEmpty) ||
      (statementChecked && someStatementEmpty),
    [
      isActionEmpty,
      isSourceEmpty,
      isTargetEmpty,
      isEqualToExistingSwitch,
      guardChecked,
      clausesViewModel.isValidationError,
      someFreeClauseEmpty,
      statementChecked,
      someStatementEmpty,
    ]
  );

  const handleResetClockChange = (clockName: string, isChecked: boolean) => {
    setResets((prev) => ({ ...prev, [clockName]: isChecked }));
  };

  const locationDropdownItems = useMemo(
    () =>
      locations.map((l) => (
        <MenuItem key={l.name} value={l.name} data-testid={'menu-item-loc-' + l.name}>
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
    freeClausesViewModel.resetFreeClauses(freeClausesViewModel);
    statementsViewModel.resetStatements(statementsViewModel);
    setJustOpened(true); // for next opening of the dialog
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    const guard: ClockConstraint | undefined = guardChecked
      ? transformToClockConstraint(clauses, freeClauses)
      : undefined;
    const resetNames: string[] = clocks.filter((c) => resets[c.name]).map((c) => c.name);
    const statement: SwitchStatement | undefined =
      statementChecked && statements.length > 0 ? transformToSwitchStatement(statements) : undefined;
    if (switchPrevVersion) {
      handleSubmit(source, action.trim(), resetNames, target, guard, statement, switchPrevVersion);
      // value reset not needed for editing because values are loaded from existing version
    } else {
      handleSubmit(source, action.trim(), resetNames, target, guard, statement);
      // reset values for next opening of dialog
      setAction('');
      setSource('');
      setTarget('');
      clocks.forEach((c) => handleResetClockChange(c.name, false));
      setGuardChecked(false);
      clausesViewModel.resetClauses(clausesViewModel);
      freeClausesViewModel.resetFreeClauses(freeClausesViewModel);
      statementsViewModel.resetStatements(statementsViewModel);
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
                checked={!!resets[clock.name]}
                onChange={(e) => handleResetClockChange(clock.name, e.target.checked)}
                data-testid={'checkbox-switch-reset-' + clock.name}
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
          label={t('switchDialog.input.action')}
          type="text"
          fullWidth
          variant="outlined"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          error={isActionEmpty}
          helperText={isActionEmpty ? t('switchDialog.error.action') : ''}
          style={{ marginBottom: '16px' }}
          data-testid={'input-switch-action'}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>{t('switchDialog.input.source')}</InputLabel>
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                label="Source"
                error={isSourceEmpty}
                data-testid={'select-switch-source'}
              >
                {locationDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>{t('switchDialog.input.target')}</InputLabel>
              <Select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                label="Target"
                error={isTargetEmpty}
                data-testid={'select-switch-target'}
              >
                {locationDropdownItems}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <FormControlLabel
          control={
            <Checkbox
              checked={guardChecked}
              onChange={(e) => setGuardChecked(e.target.checked)}
              data-testid={'checkbox-switch-hasGuard'}
            />
          }
          label={t('switchDialog.hasGuard')}
        />
        {guardChecked && <ClausesManipulation viewModel={clausesViewModel} clocks={clocks} />}
        {guardChecked && <FreeClausesManipulation viewModel={freeClausesViewModel} />}
        {guardChecked && (
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
        {guardChecked && (
          <Button
            variant="outlined"
            onMouseDown={() => freeClausesViewModel.addFreeClause(freeClausesViewModel)}
            onKeyDown={(e) =>
              executeOnKeyboardClick(e.key, () => freeClausesViewModel.addFreeClause(freeClausesViewModel))
            }
            sx={{ marginTop: 2, marginLeft: 1 }}
            data-testid={'button-add-freeClause'}
          >
            {t('freeClauses.button.addFreeClause')}
          </Button>
        )}
        <Divider sx={{ my: 1 }} />
        <FormControlLabel
          control={
            <Checkbox
              checked={statementChecked}
              onChange={(e) => setStatementChecked(e.target.checked)}
              data-testid={'checkbox-switch-hasStatement'}
            />
          }
          label={t('switchDialog.hasStatement')}
        />
        {statementChecked && <StatementManipulation viewModel={statementsViewModel} />}
        {statementChecked && (
          <Button
            variant="outlined"
            onMouseDown={() => statementsViewModel.addStatement(statementsViewModel)}
            onKeyDown={(e) =>
              executeOnKeyboardClick(e.key, () => statementsViewModel.addStatement(statementsViewModel))
            }
            sx={{ marginTop: 2 }}
            data-testid={'button-add-statement'}
          >
            {t('switchDialog.button.addStatement')}
          </Button>
        )}
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} alignItems="center">
          {resetGrid}
        </Grid>
        {equalToExistingErrorMsg}
      </DialogContent>
      <DialogActions>
        <Button
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
          variant="contained"
          color="error"
        >
          {t('switchDialog.button.cancel')}
        </Button>
        <Button
          onMouseDown={handleFormSubmit}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isValidationError}
          data-testid={'button-add-switch-ok'}
        >
          {switchPrevVersion ? t('switchDialog.button.edit') : t('switchDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateSwitchDialog;
