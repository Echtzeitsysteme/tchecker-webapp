import React, { useEffect, useMemo, useState } from 'react';
import { useButtonUtils } from '../utils/buttonUtils.ts';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SyncConstraint } from '../model/ta/syncConstraint.ts';
import { useSyncConstraintViewModel } from '../viewmodel/SyncConstraintViewModel.ts';
import { AutomatonOptionType } from '../viewmodel/OpenedProcesses.ts';
import { SyncsManipulation } from './SyncsManipulation.tsx';
import { useSyncConstraintUtils } from '../utils/syncConstraintUtils.ts';
import { useTranslation } from 'react-i18next';

interface ManipulateSyncDialog {
  open: boolean;
  synchronizations: SyncConstraint[];
  processes: AutomatonOptionType[];
  syncPrevVersion?: SyncConstraint;
  handleClose: () => void;
  handleSubmit: (syncs: SyncConstraint, prevSync?: SyncConstraint) => void;
}

export const ManipulateSyncDialog: React.FC<ManipulateSyncDialog> = (props) => {
  const { open, processes, syncPrevVersion, handleClose, handleSubmit } = props;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();
  const syncConstraintViewModel = useSyncConstraintViewModel();
  const { syncs, setSyncsFromSyncConstraint } = syncConstraintViewModel;
  const { transformToSyncConstraint } = useSyncConstraintUtils();
  const [justOpened, setJustOpened] = useState(true);
  const [lessThanTwoSyncs, setLessThanTwoSyncs] = useState(false);
  //const [sizeErrorMessage, setSizeErrorMessage] = useState('');
  const [someFieldInvalid, setSomeFieldInvalid] = useState(false);

  // effect for setting initial values upon opening the dialog
  useEffect(() => {
    // include "open" to ensure that values in dialog are correctly loaded upon opening
    if (!open || !justOpened) {
      return;
    }
    if (syncPrevVersion !== undefined) {
      // load existing integer if editing (for adding, "if" prevents entering this)
      setSyncsFromSyncConstraint(syncConstraintViewModel, syncPrevVersion);
    }
    setJustOpened(false);
  }, [open, justOpened, syncPrevVersion, setSyncsFromSyncConstraint, syncConstraintViewModel]);

  // effect to update validation checks
  useEffect(() => {
    // check validity of name field
    setLessThanTwoSyncs(syncs.length < 2);
    setSomeFieldInvalid(syncConstraintViewModel.isValidationError);

    //lessThanTwoSyncs && setSizeErrorMessage(t('syncDialog.error.lessThanTwo'));
  }, [lessThanTwoSyncs, syncConstraintViewModel.isValidationError, syncs.length, t]);

  const isValidationError: boolean = useMemo(
    () => lessThanTwoSyncs || someFieldInvalid,
    [lessThanTwoSyncs, someFieldInvalid]
  );

  const handleCloseDialog = () => {
    // reset entries when dialog is closed
    syncConstraintViewModel.resetSyncs(syncConstraintViewModel);
    setJustOpened(true); // for next opening of the dialog
    handleClose();
  };

  const handleFormSubmit = () => {
    if (isValidationError) {
      return;
    }
    const syncConstraints: SyncConstraint | undefined = transformToSyncConstraint(syncs);
    if (syncPrevVersion) {
      if (syncConstraints) {
        handleSubmit(syncConstraints, syncPrevVersion);
      }
      // value reset not needed for editing because values are loaded from existing version
    } else {
      const syncConstraints: SyncConstraint | undefined = transformToSyncConstraint(syncs);
      if (syncConstraints) {
        handleSubmit(syncConstraints);
      }
      syncConstraintViewModel.resetSyncs(syncConstraintViewModel);
    }
    setJustOpened(true); // for next opening of dialog
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>
        {syncPrevVersion ? t('syncDialog.editSync') : t('syncDialog.addSync')}
        <IconButton
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <SyncsManipulation viewModel={syncConstraintViewModel} processes={processes} />
        <Button
          variant="outlined"
          onMouseDown={() => syncConstraintViewModel.addSync(syncConstraintViewModel)}
          onKeyDown={(e) =>
            executeOnKeyboardClick(e.key, () => syncConstraintViewModel.addSync(syncConstraintViewModel))
          }
          sx={{ marginTop: 2 }}
          data-testid={'button-add-sync'}
        >
          {t('syncDialog.button.addSync')}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button
          onMouseDown={handleCloseDialog}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleCloseDialog)}
          variant="contained"
          color="error"
        >
          {t('syncDialog.button.cancel')}
        </Button>
        <Button
          onMouseDown={handleFormSubmit}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, handleFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isValidationError}
          data-testid={'button-add-sync-ok'}
        >
          {syncPrevVersion ? t('syncDialog.button.edit') : t('syncDialog.button.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManipulateSyncDialog;
