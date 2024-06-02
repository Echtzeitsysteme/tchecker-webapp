import { useEffect, useMemo, useState } from 'react';
import { Clock } from '../model/ta/clock';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface ManipulateClockDialogProps {
  open: boolean;
  clocks: Clock[];
  prevClockName?: string; // only for editing (not for adding)
  handleClose: () => void;
  handleSubmit: (
    clockName: string,
    prevClockName?: string // only for editing (not for adding)
  ) => void;
}

export const ManipulateClockDialog: React.FC<ManipulateClockDialogProps> = (props) => {
  const { open, clocks, prevClockName, handleClose, handleSubmit } = props;
  const { t } = useTranslation();

  const [clockName, setClockName] = useState<string>('');

  // effect for setting initial value upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open) {
      return;
    }

    if (!prevClockName) {
      setClockName('');
    } else {
      setClockName(prevClockName);
    }
  }, [prevClockName, open]);

  const otherClockNames = useMemo(() => {
    const names = clocks.map((c) => c.name);
    if (!prevClockName) {
      return names;
    }
    return names.filter((n) => n !== prevClockName);
  }, [clocks, prevClockName]);

  const isValidationError = useMemo(
    () => !clockName || otherClockNames.includes(clockName),
    [clockName, otherClockNames]
  );

  const errorMsg = useMemo(() => {
    if (!isValidationError) {
      return '';
    }
    if (!clockName) {
      return t('clockDialog.errorNameEmpty');
    }
    if (otherClockNames.includes(clockName)) {
      return t('clockDialog.errorNameExists');
    }
  }, [isValidationError, clockName, otherClockNames, t]);

  const handleCloseDialog = () => {
    // reset entries when dialog is closed
    setClockName('');
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    if (prevClockName) {
      handleSubmit(clockName, prevClockName);
    } else {
      handleSubmit(clockName);
      // reset entries for next opening of dialog
      setClockName('');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        style: { minWidth: '450px' },
      }}
    >
      <DialogTitle>
        {prevClockName ? t('clockDialog.title.editClock') : t('clockDialog.title.addClock')}
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
          label={'Name'}
          type="text"
          fullWidth
          variant="outlined"
          value={clockName}
          onChange={(e) => setClockName(e.target.value)}
          error={isValidationError}
          helperText={errorMsg}
          style={{ marginBottom: '16px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="contained" color="error">
          {t('clockDialog.button.cancel')}
        </Button>
        <Button onClick={handleFormSubmit} variant="contained" color="primary" disabled={isValidationError}>
          {prevClockName ? t('clockDialog.button.edit') : t('clockDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateClockDialog;
