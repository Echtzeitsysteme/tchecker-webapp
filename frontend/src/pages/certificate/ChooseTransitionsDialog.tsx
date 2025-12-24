import { Radio, RadioGroup, Button, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel } from '@mui/material';
import React, { useContext } from 'react';
import { useButtonUtils } from '../../utils/buttonUtils';
import { EdgeAttributeKey, EdgeModel, NodeAttributeKey, NodeModel, RootGraphModel } from 'ts-graphviz';

export interface ChooseTransitionsDialog {
    open: boolean;
    onClose: () => void;
    edgeOptions: EdgeModel[];
    attributeNames: Map<string, NodeAttributeKey | EdgeAttributeKey>;
    context: React.Context<{nextEdgeIdx: number; setNextEdgeIdx: React.Dispatch<React.SetStateAction<number>>}>;
    graph: RootGraphModel;
}

const ChooseTransitionsDialog: React.FC<ChooseTransitionsDialog> = (props) => {

    const { open, onClose, edgeOptions, attributeNames, context, graph } = props;
    const { executeOnKeyboardClick } = useButtonUtils();

    const {nextEdgeIdx, setNextEdgeIdx} = useContext(context);

    function getEdgeAsString(edge: EdgeModel) {

        let action = edge.attributes.get(attributeNames.get("vedge") as EdgeAttributeKey) as string;
        if(!action)
            action = ("Delay of ").concat(edge.attributes.get("delay").toString());
        action = ("Action: <").concat(action);

        let guard = edge.attributes.get(attributeNames.get("vedge_prov") as EdgeAttributeKey) as string;
        guard = ("> Provided: <").concat(guard);

        let resets = edge.attributes.get(attributeNames.get("vedge_do") as EdgeAttributeKey) as string;
        resets = ("> Do: <").concat(resets);

        const target = edge.targets[1] as NodeModel;
        const targetNode = graph.nodes.filter(node => node.id === target.id)[0];
        let targetLoc = targetNode.attributes.get(attributeNames.get("vloc") as NodeAttributeKey) as string;
        targetLoc = ("> Target location: <").concat(targetLoc);

        return action.concat(guard).concat(resets).concat(targetLoc).concat(">");
    }

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
                                <div key={getEdgeAsString(edge)}>
                                    <FormControlLabel 
                                        value={idx} 
                                        checked={idx === nextEdgeIdx}
                                        control={<Radio />} 
                                        label={getEdgeAsString(edge)} 
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