import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import React from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';
import { EdgeModel, RootGraphModel } from 'ts-graphviz';
import { getEdgeAsString } from '../EdgeFormatting';

export interface NextRoundDialog {
    open: boolean;
    onClose: () => void;
    opponentEdge: EdgeModel;
    playerIsFirst: boolean;
    graph: RootGraphModel;
}

const NextRoundDialog: React.FC<NextRoundDialog> = (props) => {

    const { open, onClose, opponentEdge, playerIsFirst, graph } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <p>
                        The opponent has chosen to take the following transition in the timed automaton
                        on the {playerIsFirst ? "right" : "left"} handside:
                        </p>

                        <p style={{ textAlign: 'center' }}><b>{!opponentEdge ? "ERROR : Undefined edge" : getEdgeAsString(opponentEdge, graph, !playerIsFirst)}</b></p>
                        
                        <p>
                        You can view this step by clicking the according button on the {playerIsFirst ? "right" : "left"}.
                        <br></br>
                        Please choose a counterstep for the {playerIsFirst ? "left" : "right"} timed automaton by selecting a
                        transition and confirming with the button on the {playerIsFirst ? "left" : "right"}.
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