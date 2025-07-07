import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

interface AbortAnalysisDialogProps {
    open: boolean;
    onClose: (result: boolean) => void;

}


const abortAnalysisDialog: React.FC<AbortAnalysisDialogProps> = ({ open, onClose }) => {

    const handleClose = (confirmed: boolean) => {
        onClose(confirmed);
    };

    return (
        <Dialog open={open} onClose={() => handleClose(false)}>
            <DialogTitle>Abort Analysis</DialogTitle>
            <DialogContent>
                Are you sure you want to abort the analysis?
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => handleClose(true)} color="secondary">
                    Abort
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default abortAnalysisDialog;