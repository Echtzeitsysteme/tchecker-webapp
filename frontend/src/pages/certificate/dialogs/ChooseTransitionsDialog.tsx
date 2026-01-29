import { Radio, RadioGroup, Grid, Button, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
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

    const {setNextEdgeIdx} = useContext(context);
    const [currentIdx, setCurrentIdx] = useState<number>(edgeOptions.length === 0 ? -1 : 0);
    const [delay, setDelay] = useState<number>(0);

    function handleClose() {
        setNextEdgeIdx(currentIdx === -1 ? -(delay + 1) : currentIdx); 
        onClose();
    }

    const selectDelay = <div>
        <Grid container spacing={1} sx={{alignItems: "center"}}>
            <Grid item>
                <b>Delay of </b>
            </Grid>
            <Grid item>
                <TextField
                  margin="dense"
                  label="Delay"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={delay}
                  onChange={(e) => setDelay(+e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                />
            </Grid>
        </Grid>
    </div>

    const setDelayOption = <div key={-1}>
        <FormControlLabel 
            value={-1} 
            checked={-1 === currentIdx || edgeOptions.length === 0}
            control={<Radio />} 
            label={selectDelay} 
        />
    </div>

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogContent>
                    <div>
                        <FormControl>
                            <RadioGroup
                                onChange={(e) => setCurrentIdx(+e.target.value)}
                            >
                            {edgeOptions.map((edge, idx) => (
                                <div key={getEdgeAsString(edge, graph, playerIsFirst)}>
                                    <FormControlLabel 
                                        value={idx} 
                                        checked={idx === currentIdx}
                                        control={<Radio />} 
                                        label={<b>{getEdgeAsString(edge, graph, playerIsFirst)}</b>} 
                                    />
                                </div>
                            )).concat(graph.nodes[0].attributes.get("zones")? setDelayOption : [])}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onMouseDown={handleClose}
                        onKeyDown={(e) => executeOnKeyboardClick(e.key, handleClose)}
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