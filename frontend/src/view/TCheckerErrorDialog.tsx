import { Warning } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface TCheckerErrorDialogProps {
    open: boolean;
    onClose: () => void;
    errorMessage: string;
}

const TCheckerErrorDialog: React.FC<TCheckerErrorDialogProps> = ({ open, onClose, errorMessage }) => {

    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} data-testid="dialog-delete-clock-confirm">
            <DialogTitle>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Warning style={{ color: 'red', fontSize: '40px' }}></Warning>
                    <span style={{ marginLeft: '12px' }}>{t('tcheckerErrorDialog.text')}</span>
                </div>

            </DialogTitle>
            <DialogContent>
                {errorMessage}
            </DialogContent>
        </Dialog>

    );
}

export default TCheckerErrorDialog;