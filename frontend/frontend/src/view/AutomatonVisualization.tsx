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
  const { locations } = ta;
  const { mapTaToVisDataModel } = useMappingUtils();
  const networkRef = useRef<HTMLDivElement>(null);

  const data: Data = mapTaToVisDataModel(ta);

  //disable physics for each node, leaving some enabled, some disabled
  locations.forEach((location) => {
    if (data.nodes) {
      data.nodes.forEach((node) => {
        if (node.id === location.name) {
          node.physics = !location.setLayout;
        }
      });
    }
  });

  useEffect(() => {
    if (!networkRef.current) {
      return;
    }

    const options: Options = {
      groups: {
        startGroup: { color: { background: '#d3d3d3' }, borderWidth: 2 },
      },
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
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -28,
          centralGravity: 0.005,
          springLength: 250,
          springConstant: 0.2,
          avoidOverlap: 0.75,
          theta: 0.1,
        },
        maxVelocity: 146,
        minVelocity: 1,
        solver: 'forceAtlas2Based',
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25,
        },
        timestep: 0.35,
      },
    };

    const network = new Network(networkRef.current, data, options);

    network.on('stabilizationIterationsDone', function () {
      const nodePositions = network.getPositions();
      locations.forEach((location) => {
        const locationName = location.name;
        location.xCoordinate = nodePositions[locationName].x;
        location.yCoordinate = nodePositions[locationName].y;
        location.setLayout = true;
      });
    });

    // Event listener for dragEnd event (update coordinates saved in locations if a location is moved)
    network.on('dragEnd', (params) => {
      const nodePositions = network.getPositions();
      locations.forEach((location) => {
        const locationName = location.name;
        location.xCoordinate = nodePositions[locationName].x;
        location.yCoordinate = nodePositions[locationName].y;
        location.setLayout = true;
      });

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
  }, [ta, viewModel, updateLocationCoordinates, mapTaToVisDataModel, locations, data]);

  return <div ref={networkRef} style={{ width: '100%', height: '100%' }} />;
};

export default AutomatonVisualization;
