import { Grid, IconButton, FormControl, InputLabel, Select, TextField, Tooltip, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ClausesViewModel } from '../viewmodel/ClausesViewModel';
import { useMemo } from 'react';
import { ClockComparator } from '../model/ta/clockComparator';
import { Clock } from '../model/ta/clock';
import { useButtonUtils } from '../utils/buttonUtils';

interface ClausesManipulationProps {
  viewModel: ClausesViewModel;
  clocks: Clock[];
}

export const ClausesManipulation: React.FC<ClausesManipulationProps> = (props) => {
  const { viewModel, clocks } = props;
  const { clauses, deleteClause, changeClause } = viewModel;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  const clockDropdownItems = useMemo(
    () =>
      clocks.map((c) => (
        <MenuItem key={c.name} value={c.name} data-testid={'menu-item-clock-' + c.name}>
          {c.name}
        </MenuItem>
      )),
    [clocks]
  );

  const comparisonDropdownItems = useMemo(
    () =>
      Object.values(ClockComparator).map((v) => (
        <MenuItem key={v} value={v} data-testid={'menu-item-comparison-' + v}>
          {v}
        </MenuItem>
      )),
    []
  );

  return (
    <>
      {clauses.map((row) => (
        <Grid key={row.id} container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <IconButton
              disabled={clauses.length <= 0}
              onMouseDown={() => deleteClause(viewModel, row.id)}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => deleteClause(viewModel, row.id))}
              data-testid={'button-delete-clause-row-' + row.id}
            >
              <Tooltip title={t('clauses.delete')}>
                <DeleteIcon />
              </Tooltip>
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>{t('clauses.input.clock')}</InputLabel>
              <Select
                value={row.clockValue}
                label="Clock"
                onChange={(e) => changeClause(viewModel, row.id, 'clockValue', e.target.value)}
                error={row.isClockInvalid}
                data-testid={'select-clock-row'}
              >
                {clockDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>{t('clauses.input.comparison')}</InputLabel>
              <Select
                value={row.comparisonValue}
                label="Comparison"
                onChange={(e) => changeClause(viewModel, row.id, 'comparisonValue', e.target.value)}
                error={row.isComparisonInvalid}
                data-testid={'select-comparison-row'}
              >
                {comparisonDropdownItems}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              margin="dense"
              label={t('clauses.input.value')}
              type="number"
              fullWidth
              variant="outlined"
              value={row.numberInput}
              onChange={(e) => changeClause(viewModel, row.id, 'numberInput', e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
              error={row.isNumberInvalid}
              data-testid={'select-comparison-number-row'}
            />
          </Grid>
        </Grid>
      ))}
    </>
  );
};
