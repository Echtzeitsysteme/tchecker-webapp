import React, { useEffect, useRef } from 'react';
import { Data, Edge, Network, Node, Options } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { useFormattingUtils } from '../utils/formattingUtils';

interface VisualizationProps {
  viewModel: AnalysisViewModel;
}

const AutomatonVisualization: React.FC<VisualizationProps> = (props) => {
  const { viewModel } = props;
  const { ta, updateLocationCoordinates } = viewModel;
  const { formatLocationLabelVisual, formatSwitchLabelVisual } = useFormattingUtils();
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: move transformation to a util class?
    if (networkRef.current) {
      const nodes = new DataSet<Node>();
      const edges = new DataSet<Edge>();

      ta.locations.forEach((location) => {
        nodes.add({
          id: `${location.name}`,
          label: formatLocationLabelVisual(location),
          x: location.xCoordinate,
          y: location.yCoordinate,
        });
      });

      ta.switches.forEach((sw) => {
        edges.add({
          // TODO: add guard and resets to ID (to make ID unique)
          id: `FROM${sw.source.name}TO${sw.target.name}ACTION${sw.actionLabel}`,
          from: `${sw.source.name}`,
          to: `${sw.target.name}`,
          label: formatSwitchLabelVisual(sw),
        });
      });

      const data: Data = {
        nodes: nodes,
        edges: edges,
      };
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
    }
  }, [
    ta.locations,
    ta.switches,
    viewModel,
    updateLocationCoordinates,
    formatLocationLabelVisual,
    formatSwitchLabelVisual,
  ]);

  return <div ref={networkRef} style={{ width: '100%', height: '100%' }} />;
};

export default AutomatonVisualization;
