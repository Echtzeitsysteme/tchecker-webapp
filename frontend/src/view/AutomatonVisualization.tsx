import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { TimedAutomaton } from '../model/ta/timedAutomaton';

interface VisualizationProps {
  ta: TimedAutomaton;
  // Define any props your component might take, such as data for nodes and edges
}

const MyNetwork: React.FC<VisualizationProps> = (props) => {
  const networkRef = useRef<HTMLDivElement>(null);
  console.log(props);

  useEffect(() => {
    if (networkRef.current) {
      // Define nodes and edges
      const nodes = new DataSet([
        { id: 1, label: 'State 1\n5' },
        { id: 2, label: 'State 2' },
      ]);

      const edges = new DataSet([{ id: '1to2', from: 1, to: 2, label: 'x > 5' }]);

      // Provide the data and configuration to the network
      const data = {
        nodes: nodes,
        edges: edges,
      };
      const options = {}; // Customization options

      // Initialize the network
      new Network(networkRef.current, data, options);
    }
  }, []); // Empty dependency array means this effect runs once on mount

  return <div ref={networkRef} style={{ width: '600px', height: '400px' }} />;
};

export default MyNetwork;
