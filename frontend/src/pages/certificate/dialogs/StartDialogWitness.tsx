import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';

export interface StartDialog {
    open: boolean;
    onClose: () => void;
}

const StartDialog: React.FC<StartDialog> = (props) => {

    const { open, onClose } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <p>
                        Please select which timed automaton you want to take a step in.
                        </p>

                        <p>
                        You can then choose a transition by clicking on the corresponding button and confirm your choice 
                        with the next step button.
                        </p>

                        <p>
                        To view the counterstep of your opponent, click the next step button on the other side.
                        </p>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onMouseDown={() => onClose()}
                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => onClose())}
                        variant="contained"
                        color="error"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
};

export default StartDialog;