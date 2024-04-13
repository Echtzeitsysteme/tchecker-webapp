import { Grid, IconButton, FormControl, InputLabel, Select, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClauseData } from './ManipulateLocationDialog';

export interface ClausesManipulationProps {
  clauses: ClauseData[];
  clockDropdownItems: JSX.Element[];
  comparisonDropdownItems: JSX.Element[];
  handleClauseChange: (id: number, field: keyof ClauseData, value: string) => void;
  handleDeleteClause: (id: number) => void;
}

export const ClausesManipulation: React.FC<ClausesManipulationProps> = (props) => {
  const { clauses, clockDropdownItems, comparisonDropdownItems, handleClauseChange, handleDeleteClause } = props;
  return (
    <>
      {clauses.map((row) => (
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
              onChange={(e) => handleClauseChange(row.id, 'numberInput', e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
              error={row.isNumberInvalid}
            />
          </Grid>
        </Grid>
      ))}
    </>
  );
};
