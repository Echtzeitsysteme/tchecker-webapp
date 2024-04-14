import { Grid, IconButton, FormControl, InputLabel, Select, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ClausesViewModel } from '../viewmodel/ClausesViewModel';

interface ClausesManipulationProps {
  viewModel: ClausesViewModel;
  clockDropdownItems: JSX.Element[];
  comparisonDropdownItems: JSX.Element[];
}

export const ClausesManipulation: React.FC<ClausesManipulationProps> = (props) => {
  const { viewModel, clockDropdownItems, comparisonDropdownItems } = props;
  const { clauses, deleteClause, changeClause } = viewModel;
  const { t } = useTranslation();

  return (
    <>
      {clauses.map((row) => (
        <Grid key={row.id} container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <IconButton disabled={clauses.length <= 1} onClick={() => deleteClause(viewModel, row.id)}>
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
            />
          </Grid>
        </Grid>
      ))}
    </>
  );
};
