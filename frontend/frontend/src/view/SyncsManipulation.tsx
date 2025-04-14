import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useButtonUtils } from '../utils/buttonUtils.ts';
import DeleteIcon from '@mui/icons-material/Delete';
import { SyncViewModel } from '../viewmodel/SyncConstraintViewModel.ts';
import { AutomatonOptionType } from '../viewmodel/OpenedProcesses.ts';
import {useTranslation} from "react-i18next";

interface SyncsManipulationProps {
  viewModel: SyncViewModel;
  processes: AutomatonOptionType[];
}

export const SyncsManipulation: React.FC<SyncsManipulationProps> = (props) => {
  const { viewModel, processes } = props;
  const { syncs, deleteSync, changeSync, changeWeakOrNot } = viewModel;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  const processDropdownItems = useMemo(
    () =>
      processes.map((process) => (
        <MenuItem key={process.label} value={process.label} data-testid={'menu-item-proc-' + process.label}>
          {process.label}
        </MenuItem>
      )),
    [processes]
  );

  return (
    <>
      {syncs.map((row) => (
        <Grid key={row.id} container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <IconButton
              disabled={syncs.length <= 0}
              onMouseDown={() => deleteSync(viewModel, row.id)}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => deleteSync(viewModel, row.id))}
              data-testid={'button-delete-sync-row-' + row.id}
            >
              <Tooltip title={t('sync.delete')}>
                <DeleteIcon />
              </Tooltip>
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>{t('sync.input.process')}</InputLabel>
              <Select
                value={row.processValue}
                label="Process"
                onChange={(e) => changeSync(viewModel, row.id, 'processValue', e.target.value)}
                error={row.isProcessInvalid}
                data-testid={'select-process-row'}
              >
                {processDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              margin="dense"
              label={t('sync.input.event')}
              fullWidth
              variant="outlined"
              value={row.actionValue}
              onChange={(e) => changeSync(viewModel, row.id, 'actionValue', e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
              error={row.isActionInvalid}
              data-testid={'enter-action-row'}
            />
          </Grid>
          <Grid item xs={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!row.weakSync}
                  onChange={(e) => changeWeakOrNot(viewModel, row.id, e.target.checked)}
                />
              }
              label={t('sync.input.isWeakSync')}
              data-testid={'checkbox-sync-is-weak'}
            />
          </Grid>
        </Grid>
      ))}
    </>
  );
};
