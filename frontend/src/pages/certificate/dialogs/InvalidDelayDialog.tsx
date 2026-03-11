import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';

export interface InvalidDelayDialog {
    open: boolean;
    onClose: () => void;
    delay: number;
}

const InvalidDelayDialog: React.FC<InvalidDelayDialog> = (props) => {

    const { open, onClose, delay } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <h3><center>Invalid delay</center></h3>
                        <p>
                            {!(new RegExp(/^\d*(\.5(0)*)?$/)).test(delay.toString())? 
                            "Delay " : 
                            "Executing a delay of "}
                            <b>{delay}</b>
                            {!(new RegExp(/^\d*(\.5(0)*)?$/)).test(delay.toString())? 
                            " is invalid. Only 0.5-step increments are permitted for delays." : 
                            " would violate the invariant of one of the automaton's processes' current location."}   
                            <br></br>
                            Please choose a different delay or a different transition.
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

export default InvalidDelayDialog;