import { fromDot, EdgeModel, NodeModel, RootGraphModel, EdgeAttributeKey, NodeAttributeKey } from 'ts-graphviz';
import { useCallback, useEffect } from 'react';
import './custom-attributes.d.ts'

export interface CertificateParser {
    graph: RootGraphModel;
    getOutgoingEdges: (node: NodeModel) => EdgeModel[]
}

export function useCertificateParser(dot: string) {
    const graph = fromDot(dot);
    const outgoingEdges = new Map<NodeModel, EdgeModel[]>(); // !

    const getOutgoingEdges = useCallback((node: NodeModel) => {
        return outgoingEdges.get(node);
    }, []);

    const certificate: CertificateParser = {graph: graph, getOutgoingEdges: getOutgoingEdges}

    async function stringToList(list: string[]) {
        let result = [];
        let cur = "";
        for(const e of list){
            if(e == "<") {
                continue;
            } else if(e == "," || e == ">") {
                result = result.concat(cur);
                cur = "";
            } else {
                cur = e ? cur.concat(e) : cur;
            }
        }
        return result;
    }

    useEffect(() => {  
        const fetchData = async () => {
            // set outgoing edge map
            graph.edges.forEach(edge => {
                if(!outgoingEdges.has(edge.targets[0] as NodeModel)){
                    outgoingEdges.set(edge.targets[0] as NodeModel, [edge]);
                } else {
                    outgoingEdges.get(edge.targets[0] as NodeModel).concat(edge);
                }
            })
            //convert strings to lists
            graph.edges.forEach(async edge => {
                for(const attribute of ['first_vedge', 'first_vedge_do', 'first_vedge_prov', 'second_vedge', 'second_vedge_do', 'second_vedge_prov']) {
                    const list = await stringToList(edge.attributes.get(attribute as EdgeAttributeKey.values) as string[]);
                    edge.attributes.set(attribute as EdgeAttributeKey.values, list);
                }
            })
            graph.nodes.forEach(async node => {
                for(const attribute of ['clockval_1', 'clockval_2', 'first_intval', 'first_vloc', 'second_intval', 'second_vloc']) {
                    const list = await stringToList(node.attributes.get(attribute as NodeAttributeKey.values) as string[]);
                    node.attributes.set(attribute as NodeAttributeKey.values, list);
                }
            })
        }

        fetchData();
    }, []);

    return certificate;
}
