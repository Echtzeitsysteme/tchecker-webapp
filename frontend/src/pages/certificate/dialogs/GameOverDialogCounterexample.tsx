import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';

export interface GameOverDialog {
    open: boolean;
    onClose: () => void;
    finalSymbol: string;
    playerIsFirst: boolean;
}

const NextRoundDialog: React.FC<GameOverDialog> = (props) => {

    const { open, onClose, finalSymbol, playerIsFirst } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <h3><center>YOU LOST!</center></h3>
                        <p>
                        The opponent has chosen the action <b>&lt;{finalSymbol}&gt;</b> for the {playerIsFirst ? "right" : "left"} timed automaton.
                        <br></br>
                        In the {playerIsFirst ? "left" : "right"} automaton, there is no transition available for this action.
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

export default NextRoundDialog;