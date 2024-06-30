import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Clock } from '../model/ta/clock';
import { useTranslation } from 'react-i18next';
import { useButtonUtils } from '../utils/buttonUtils';

interface ClockDeleteConfirmDialogProps {
  clock?: Clock;
  open: boolean;
  onClose: () => void;
  onDelete: (clockToDelete: Clock) => void;
}

const ClockDeleteConfirmDialog: React.FC<ClockDeleteConfirmDialogProps> = (props) => {
  const { clock, open, onClose, onDelete } = props;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  if (!open) {
    return <></>;
  }

  if (!clock) {
    throw Error('Clock for delete-confirm dialog is undefined or null');
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('deleteClockConfirmDialog.title', { clockName: clock.name })}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('deleteClockConfirmDialog.contentText', { clockName: clock.name })}</DialogContentText>
        <p>
          <b>{t('deleteClockConfirmDialog.contentTextWarning')}</b>
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          onMouseDown={onClose}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, onClose)}
          variant="contained"
          color="primary"
        >
          {t('deleteClockConfirmDialog.button.cancel')}
        </Button>
        <Button
          onMouseDown={() => onDelete(clock)}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => onDelete(clock))}
          variant="contained"
          color="error"
        >
          {t('deleteClockConfirmDialog.button.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClockDeleteConfirmDialog;
