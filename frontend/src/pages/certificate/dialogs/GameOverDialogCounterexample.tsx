import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';

export interface GameOverDialog {
    open: boolean;
    onClose: () => void;
    finalSymbol: string;
    playerIsFirst: boolean;
}

const GameOverDialog: React.FC<GameOverDialog> = (props) => {

    const { open, onClose, finalSymbol, playerIsFirst } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <h3><center>YOU LOST!</center></h3>
                        <p>
                        The opponent has chosen the action <b>&lt;{finalSymbol}&gt;</b> for the timed automaton on the {playerIsFirst ? "right" : "left"}-hand side.
                        <br></br>
                        In the automaton on the {playerIsFirst ? "left" : "right"}, there is no transition available for this action.
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

export default GameOverDialog;