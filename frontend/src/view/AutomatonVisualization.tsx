import React, { useEffect, useRef } from 'react';
import { Data, Edge, Network, Node, Options } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';

interface VisualizationProps {
  viewModel: AnalysisViewModel;
}

const AutomatonVisualization: React.FC<VisualizationProps> = (props) => {
  const { viewModel } = props;
  const { ta, updateLocationCoordinates } = viewModel;
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: move transformation to a util class?
    if (networkRef.current) {
      const nodes = new DataSet<Node>();
      const edges = new DataSet<Edge>();

      ta.locations.forEach((location) => {
        const label =
          `${location.name}` + `${location.invariant ? `\n${formatClockConstraint(location.invariant)}` : ''}`;
        nodes.add({
          id: `${location.name}`,
          label: label,
          x: location.xCoordinate,
          y: location.yCoordinate,
        });
      });

      ta.switches.forEach((sw) => {
        const label =
          `${sw.actionLabel}` +
          `${sw.guard ? `\n${formatClockConstraint(sw.guard)}` : ''}` +
          `\n{ ${sw.reset.map((clock) => clock.name).join(', ')} }`;

        edges.add({
          id: `FROM${sw.source.name}TO${sw.target.name}`,
          from: `${sw.source.name}`,
          to: `${sw.target.name}`,
          label,
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
          const nodeId = params.nodes[0]; // Assuming single node drag (can extend this for multiple nodes)
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
  }, [ta.locations, ta.switches, updateLocationCoordinates, viewModel]);

  return <div ref={networkRef} style={{ width: '100%', height: '100%' }} />;
};

function formatClockConstraint(constraint: ClockConstraint): string {
  return `${constraint.lhs.name} ${constraint.op} ${constraint.rhs}`;
}

export default AutomatonVisualization;
