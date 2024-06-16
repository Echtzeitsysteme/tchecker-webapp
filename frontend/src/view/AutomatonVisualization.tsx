import React, { useEffect, useRef } from 'react';
import { Data, Network, Options } from 'vis-network/peer';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { useMappingUtils } from '../utils/mappingUtils';

interface VisualizationProps {
  viewModel: AnalysisViewModel;
}

const AutomatonVisualization: React.FC<VisualizationProps> = (props) => {
  const { viewModel } = props;
  const { ta, updateLocationCoordinates } = viewModel;
  const { mapTaToVisDataModel } = useMappingUtils();
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!networkRef.current) {
      return;
    }

    const data: Data = mapTaToVisDataModel(ta);
    const options: Options = {
      nodes: {
        shape: 'box',
        color: {
          background: 'white',
          border: 'black',
        },
        font: {
          size: 20,
        },
      },
      edges: {
        color: 'gray',
        arrows: {
          to: { enabled: true, type: 'arrow' },
        },
        font: {
          size: 20,
        },
      },
      physics: {
        enabled: false,
      },
    };

    const network = new Network(networkRef.current, data, options);

    // Event listener for dragEnd event (update coordinates saved in locations if a location is moved)
    network.on('dragEnd', (params) => {
      // Check if nodes are dragged
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0]; // Assuming single node drag (can be extended for multiple nodes)
        const nodePosition = network.getPositions([nodeId]);

        // Update TA model
        ta.locations.forEach((location) => {
          if (location.name === nodeId) {
            updateLocationCoordinates(viewModel, location.name, nodePosition[nodeId].x, nodePosition[nodeId].y);
          }
        });
      }
    });
  }, [ta, viewModel, updateLocationCoordinates, mapTaToVisDataModel]);

  return <div ref={networkRef} style={{ width: '100%', height: '100%' }} />;
};

export default AutomatonVisualization;
