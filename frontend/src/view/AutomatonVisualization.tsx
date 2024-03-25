import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { ClockConstraint } from '../model/ta/clockConstraint';

interface VisualizationProps {
  ta: TimedAutomaton;
  // Define any props your component might take, such as data for nodes and edges
}

const MyNetwork: React.FC<VisualizationProps> = (props) => {
  const { ta } = props;
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (networkRef.current) {
      const nodes = new DataSet<{ id: string; label: string }>();
      const edges = new DataSet<{ id: string; from: string; to: string; label: string }>();

      ta.locations.forEach((location, index) => {
        const label = `${location.name}${location.invariant ? `\n${formatClockConstraint(location.invariant)}` : ''}`;
        nodes.add({
          id: `${index}`,
          label,
        });
      });

      ta.switches.forEach((sw) => {
        const fromIndex = ta.locations.indexOf(sw.source);
        const toIndex = ta.locations.indexOf(sw.target);
        const label = `${sw.action.name}${sw.guard ? `\n${formatClockConstraint(sw.guard)}` : ''}\n{ ${sw.reset.map((clock) => clock.name).join(', ')} }`;

        edges.add({
          id: `FROM${fromIndex}TO${toIndex}`,
          from: `${fromIndex}`,
          to: `${toIndex}`,
          label,
        });
      });

      // Provide the data and configuration to the network
      const data = {
        nodes: nodes,
        edges: edges,
      };
      const options = {
        nodes: {
          color: '#ffcc00',
          shape: 'ellipse',
        },
        edges: {
          color: '#848484',
          arrows: {
            to: { enabled: true, type: 'arrow' },
          },
        },
        physics: {
          enabled: false,
        },
      };

      new Network(networkRef.current, data, options);
    }
  }, [ta.locations, ta.switches]);

  return <div ref={networkRef} style={{ width: '600px', height: '400px' }} />;
};

function formatClockConstraint(constraint: ClockConstraint): string {
  return `${constraint.lhs.name} ${constraint.op} ${constraint.rhs}`;
}

export default MyNetwork;
