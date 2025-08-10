import { Box } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import AutomatonVisualization from './AutomatonVisualization';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses';
import { SimulationModel } from '../viewmodel/SimulationModel';
import { useEffect, useRef } from 'react';

export interface TCheckerSimulationProps {
    viewModel: AnalysisViewModel;
    openedProcesses: OpenedProcesses;
    simulationModel: SimulationModel;
}


export const TCheckerSimulation: React.FC<TCheckerSimulationProps> = (props) => {
    const { viewModel, openedProcesses, simulationModel } = props;
    const childRef = useRef();

    useEffect(() => {
        console.log('TCheckerSimulation useEffect', simulationModel.currentState, simulationModel.nextStates);

        if (!simulationModel.currentState || !simulationModel.nextStates) {
            return;
        }

        const automatonIndex = openedProcesses.automatonOptions.findIndex(
            (option) => option.label === openedProcesses.selectedOption.label);
        openedProcesses.selectedOption

        if (automatonIndex === -1) {
            return;
        }

        
        const activeLocation = simulationModel.currentState.locations[automatonIndex];

        highlighLocation(activeLocation);


    }, [viewModel, openedProcesses, simulationModel.currentState, simulationModel.nextStates]);

    function highlighLocation(locationId: string) {
        if (childRef.current) {
            const childComponent = childRef.current as any;
            childComponent.highlightNode(locationId);
        }
    }



    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
            }}
        >
            <AutomatonVisualization viewModel={viewModel} ref={childRef} />

        </Box>
    )
}

export default TCheckerSimulation;