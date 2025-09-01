import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from '../model/ta/clock';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useButtonUtils } from '../utils/buttonUtils';

interface ManipulateClockDialogProps {
  open: boolean;
  clocks: Clock[];
  prevClock?: Clock; // only for editing (not for adding)
  handleClose: () => void;
  handleSubmit: (
    clockName: string,
    size: string,
    prevClockName?: string // only for editing (not for adding)
  ) => void;
}

export const ManipulateClockDialog: React.FC<ManipulateClockDialogProps> = (props) => {
  const { open, clocks, prevClock, handleClose, handleSubmit } = props;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  const [clockName, setClockName] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [isSizeInvalid, setIsSizeInvalid] = useState(false);
  const [sizeErrorMsg, setSizeErrorMsg] = useState('');

  // effect for setting initial value upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open) {
      return;
    }

    if (!prevClock) {
      setClockName('');
      setSize('');
    } else {
      setClockName(prevClock.name);
      setSize(prevClock.size.toString());
    }
  }, [prevClock, open]);

  const otherClockNames = useMemo(() => {
    const names = clocks.map((c) => c.name);
    if (!prevClock) {
      return names;
    }
    return names.filter((n) => n !== prevClock.name);
  }, [clocks, prevClock]);

  useEffect(() => {
    setIsSizeInvalid(size.trim() === '' || parseInt(size) < 1);

    isSizeInvalid && setSizeErrorMsg(t('clockDialog.errorSizeInvalid'));
  }, [isSizeInvalid, size, t]);

  const isValidationError = useMemo(
    () => !clockName || otherClockNames.includes(clockName) || !size || isSizeInvalid,
    [clockName, isSizeInvalid, otherClockNames, size]
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
    setSize('');
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    if (prevClock) {
      handleSubmit(clockName.trim(), size, prevClock.name);
    } else {
      handleSubmit(clockName.trim(), size);
      // reset entries for next opening of dialog
      setClockName('');
      setSize('');
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
        {prevClock ? t('clockDialog.title.editClock') : t('clockDialog.title.addClock')}
        <IconButton
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={7}>
            <TextField
              margin="dense"
              label={t('clockDialog.input.name')}
              type="text"
              fullWidth
              variant="outlined"
              value={clockName}
              onChange={(e) => setClockName(e.target.value)}
              error={isValidationError}
              helperText={errorMsg}
              style={{ marginBottom: '16px' }}
              data-testid={'input-clock-name'}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              margin="dense"
              label={t('clockDialog.input.size')}
              type="number"
              fullWidth
              variant="outlined"
              value={size}
              onChange={(e) => (parseInt(e.target.value) < 0 ? setSize('0') : setSize(e.target.value))}
              InputProps={{ inputProps: { min: 0 } }}
              error={isSizeInvalid}
              helperText={isSizeInvalid ? sizeErrorMsg : ''}
              style={{ marginBottom: '16px' }}
              data-testid={'select-clock-size'}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
          variant="contained"
          color="error"
        >
          {t('clockDialog.button.cancel')}
        </Button>
        <Button
          onMouseDown={handleFormSubmit}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isValidationError}
          data-testid={'button-add-clock-ok'}
        >
          {prevClock ? t('clockDialog.button.edit') : t('clockDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateClockDialog;
