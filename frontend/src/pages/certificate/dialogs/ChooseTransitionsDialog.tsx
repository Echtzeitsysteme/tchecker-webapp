import { Radio, RadioGroup, Button, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel } from '@mui/material';
import React, { useContext } from 'react';
import { useButtonUtils } from '../../../utils/buttonUtils';
import { EdgeModel, RootGraphModel } from 'ts-graphviz';
import { getEdgeAsString } from '../EdgeFormatting';

export interface ChooseTransitionsDialog {
    open: boolean;
    onClose: () => void;
    edgeOptions: EdgeModel[];
    playerIsFirst: boolean;
    context: React.Context<{nextEdgeIdx: number; setNextEdgeIdx: React.Dispatch<React.SetStateAction<number>>}>;
    graph: RootGraphModel;
}

const ChooseTransitionsDialog: React.FC<ChooseTransitionsDialog> = (props) => {

    const { open, onClose, edgeOptions, playerIsFirst, context, graph } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    const {nextEdgeIdx, setNextEdgeIdx} = useContext(context);

    function handleRadioChange (e: React.ChangeEvent<HTMLInputElement>): void {
        console.log('RadioGroup changed:', e.target.value);
        setNextEdgeIdx(+e.target.value)
    };

    return (
        <>
            <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <FormControl>
                            <RadioGroup
                                onChange={handleRadioChange}
                            >
                            {edgeOptions.map((edge, idx) => (
                                <div key={getEdgeAsString(edge, graph, playerIsFirst)}>
                                    <FormControlLabel 
                                        value={idx} 
                                        checked={idx === nextEdgeIdx}
                                        control={<Radio />} 
                                        label={<b>{getEdgeAsString(edge, graph, playerIsFirst)}</b>} 
                                    />
                                </div>
                            ))}
                            </RadioGroup>
                        </FormControl>
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

export default ChooseTransitionsDialog;