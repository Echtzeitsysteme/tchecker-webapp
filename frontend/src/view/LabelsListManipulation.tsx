import { Grid, IconButton, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useButtonUtils } from '../utils/buttonUtils';
import { LabelsViewModel } from '../viewmodel/LabelsListViewModel.ts';
import React from 'react';
import {useTranslation} from "react-i18next";

interface LabelsManipulationProps {
  viewModel: LabelsViewModel;
}

export const LabelsListManipulation: React.FC<LabelsManipulationProps> = (props) => {
  const { viewModel } = props;
  const { labels, deleteLabel, changeLabel } = viewModel;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  return (
    <>
      {labels.map((row) => (
        <Grid key={row.id} container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <IconButton
              disabled={labels.length <= 0}
              onMouseDown={() => deleteLabel(viewModel, row.id)}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, () => deleteLabel(viewModel, row.id))}
              data-testid={'button-delete-label-row-' + row.id}
            >
              <Tooltip title={t('labels.delete')}>
                <DeleteIcon />
              </Tooltip>
            </IconButton>
          </Grid>
          <Grid item xs={11}>
            <TextField
              margin="dense"
              label={t('labels.input')}
              fullWidth
              variant="outlined"
              value={row.term}
              onChange={(e) => changeLabel(viewModel, row.id, 'freeInput', e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
              data-testid={'enter-label-row'}
            />
          </Grid>
        </Grid>
      ))}
    </>
  );
};
