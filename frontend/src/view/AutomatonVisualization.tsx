import React, { useEffect, useRef } from 'react';
import { Data, Edge, Network, Node, Options } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { TimedAutomaton } from '../model/ta/timedAutomaton';
import { ClockConstraint } from '../model/ta/clockConstraint';

interface VisualizationProps {
  ta: TimedAutomaton;
}

const AutomatonVisualization: React.FC<VisualizationProps> = (props) => {
  const { ta } = props;
  const networkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: move transformation to a util class
    if (networkRef.current) {
      const nodes = new DataSet<Node>();
      const edges = new DataSet<Edge>();

      ta.locations.forEach((location, index) => {
        const label = `${location.name}${location.invariant ? `\n${formatClockConstraint(location.invariant)}` : ''}`;
        nodes.add({
          id: `${index}`,
          label: label,
        });
      });

      ta.switches.forEach((sw) => {
        const fromIndex = ta.locations.indexOf(sw.source);
        const toIndex = ta.locations.indexOf(sw.target);
        const label =
          `${sw.action.name}` +
          `${sw.guard ? `\n${formatClockConstraint(sw.guard)}` : ''}` +
          `\n{ ${sw.reset.map((clock) => clock.name).join(', ')} }`;

        edges.add({
          id: `FROM${fromIndex}TO${toIndex}`,
          from: `${fromIndex}`,
          to: `${toIndex}`,
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

      new Network(networkRef.current, data, options);
    }
  }, [ta.locations, ta.switches]);

  return <div ref={networkRef} style={{ width: '100%', height: '100%' }} />;
};

function formatClockConstraint(constraint: ClockConstraint): string {
  return `${constraint.lhs.name} ${constraint.op} ${constraint.rhs}`;
}

export default AutomatonVisualization;
