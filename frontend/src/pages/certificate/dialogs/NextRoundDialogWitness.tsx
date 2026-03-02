import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';
import { getEdgeAsString } from '../EdgeFormatting';

export interface NextRoundDialog {
    open: boolean;
    onClose: () => void;
    opponentEdge: {transition: any; target: any};
    opponentDelay: number;
    playerIsFirst: boolean;
}

const NextRoundDialog: React.FC<NextRoundDialog> = (props) => {

    const { open, onClose, opponentEdge, opponentDelay, playerIsFirst } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <p>
                        The opponent has chosen to take the following transition in the timed automaton
                        on the {playerIsFirst ? "right" : "left"}-hand side:
                        </p>

                        <p style={{ textAlign: 'center' }}><b>{opponentDelay === null ? 
                        (!opponentEdge ? "ERROR : Undefined edge" : getEdgeAsString(opponentEdge)) : 
                        ("Delay of ").concat(opponentDelay.toString())}</b></p>
                        
                        <p>
                        Please select which timed automaton you want to take your next step in.
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

export default NextRoundDialog;