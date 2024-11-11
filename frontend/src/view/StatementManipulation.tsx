import { Grid, IconButton, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useButtonUtils } from '../utils/buttonUtils';
import { StatementsViewModel } from '../viewmodel/StatementsViewModel.ts';
import React from 'react';
import {useTranslation} from "react-i18next";

interface StatementManipulationProps {
  viewModel: StatementsViewModel;
}

export const StatementManipulation: React.FC<StatementManipulationProps> = (props) => {
  const { viewModel } = props;
  const { statements, deleteStatement, changeStatement } = viewModel;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  return (
    <>
      {statements.map((row) => (
        <Grid key={row.id} container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <IconButton
              disabled={statements.length <= 0}
              onMouseDown={() => deleteStatement(viewModel, row.id)}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => deleteStatement(viewModel, row.id))}
              data-testid={'button-delete-statement-row-' + row.id}
            >
              <Tooltip title={t('statements.delete')}>
                <DeleteIcon />
              </Tooltip>
            </IconButton>
          </Grid>
          <Grid item xs={11}>
            <TextField
              margin="dense"
              label={t('statements.input')}
              fullWidth
              variant="outlined"
              value={row.term}
              onChange={(e) => changeStatement(viewModel, row.id, 'freeInput', e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
              data-testid={'enter-statement-row'}
            />
          </Grid>
        </Grid>
      ))}
    </>
  );
};
