import { forwardRef, useEffect, useRef, useState } from 'react';
// import { useImperativeHandle} from 'react';
import { Data, Network, Options } from 'vis-network/peer';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { useMappingUtils } from '../utils/mappingUtils';

interface VisualizationProps {
  viewModel: AnalysisViewModel;
  coloredLoc: string;
  coloredSwitch: string;
}

const AutomatonVisualization = forwardRef((props: VisualizationProps, ref) => {
  const { viewModel, coloredLoc, coloredSwitch } = props;
  const { ta, updateLocationCoordinates } = viewModel;
  const { locations } = ta;
  const { mapTaToVisDataModel } = useMappingUtils();
  const networkRef = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  // const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

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

  // useImperativeHandle(ref, () => ({
  //   highlightNode: (nodeId: string) => highlightNode(nodeId),
  // }));

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

    var data = data;

    if (coloredLoc) {
      data = colorElement(coloredLoc, true);
    }
    if (coloredSwitch) {
      data = colorElement(coloredSwitch, false);
    }

    const network = new Network(networkRef.current, data, options);

    network.on('stabilizationIterationsDone', function () {

      const nodePositions = network.getPositions();
      locations.forEach((location) => {
        const locationName = location.name;
        location.xCoordinate = nodePositions[locationName].x;
        location.yCoordinate = nodePositions[locationName].y;
        location.setLayout = true;
      });

      // if (highlightedNode) {
      //   highlightNode(highlightedNode);
      // }
    });

    network.on('click', (params) => {
      console.log('Clicked node:', params);
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
    
    setNetwork(network);

  }, [viewModel, mapTaToVisDataModel]);

  // function highlightNode(nodeId: string) {
  //   console.log('Highlighting node:', nodeId);
  //   setHighlightedNode(nodeId);
    
  //   if (!network || !nodeId) {
  //     console.log('Network or nodeId is not defined');
  //     return;
  //   }
    
  //   if (highlightedNode && nodeExists(highlightedNode)) {
  //     if (highlightedNode !== nodeId) {
  //       network.updateClusteredNode(highlightedNode, {
  //         color: {
  //           background: 'white',
  //           border: 'black',
  //         }
  //       });
  //     }
  //   }


  //   if (nodeExists(nodeId)) {
  //     network.updateClusteredNode(nodeId, {
  //       color: {
  //         background: '#3A9BDC',
  //         border: '#1260cc',
  //       }
  //     })
  //   } else {
  //     console.warn(`Node with ID ${nodeId} does not exist in the network.`);
  //   }
  // }

  function colorElement(id: string, isNode: boolean) {
    const newData = data;

    if (!id) {
      console.log('nodeId is not defined');
      return data;
    }
    if (!network) {
      return data;
    }

    var elementExists = false;
    if (isNode) {
      newData.nodes.forEach((node) => {
        if (node.id === id) {
          node.color = {
            background: '#ffb3d7ff',
            border: '#ca568cff',
          }
          elementExists = true;
        }
      }) 
    } else {
      newData.edges.forEach((edge) => {
        if (edge.id == id) {
          edge.color = '#ca568cff';
          elementExists = true;
        }
      })
    }
    if (!elementExists) {
      console.warn(`Element with ID ${id} does not exist in the network.`);
    }
    return newData;

  }

  // function highlightEdge(edgeId: string) {
  //   console.log('Highlighting edge:', edgeId);
  //   if (!network || !edgeId) {
  //     console.log('Network or edgeId is not defined');
  //     return;
  //   }

  //   if (edgeExists(edgeId)) {
  //     network.updateEdge(edgeId, {
  //       color: {
  //         color: '#3A9BDC',
  //         highlight: '#1260cc',
  //       }
  //     });
  //   } else {
  //     console.warn(`Edge with ID ${edgeId} does not exist in the network.`);
  //   }
  // }


  // function nodeExists(nodeId: string): boolean {
  //   const nodePath = network?.findNode(nodeId)
  //   return nodePath && nodePath.length > 0;
  // }

  // function edgeExists(edgeId: string): boolean {
  //   const edgePath = network?.getBaseEdges(edgeId);
  //   return edgePath && edgePath.length > 0;
  // }

  return <div ref={networkRef} style={{ width: '100%', height: '100%' }} />;
});

export default AutomatonVisualization;
