import { fromDot, Edge, EdgeModel, NodeModel, RootGraphModel,/*  EdgeAttributeKey, */ NodeAttributeKey, toDot, Digraph } from 'ts-graphviz';
import './custom-attributes.d.ts'

export class Certificate {

    readonly graph: RootGraphModel;
    private outgoingEdges = new Map<string, EdgeModel[]>();

    constructor(dot: string) {

        // console.log(dot)

        const originalGraph = fromDot(dot);

        // copy graph without 0 delay (synchronization) transitions
        this.graph = new Digraph();

        // get all sync transitions
        let syncEdges = new Map<string, string>();
        for(const edge of originalGraph.edges)
            if(edge.attributes.get("delay") == 0)
                syncEdges.set((edge.targets[0] as NodeModel).id, (edge.targets[1] as NodeModel).id);

        // only add nodes that are not a source node of a sync transition
        for(const node of originalGraph.nodes)
            if(!syncEdges.get(node.id))
                this.graph.addNode(node);

        for(const edge of originalGraph.edges) {
            // do not add sync transitions
            if(edge.attributes.get("delay") == 0)
                continue;

            const sourceNodeId = (edge.targets[0] as NodeModel).id;
            const targetNodeId = (edge.targets[1] as NodeModel).id;
            
            // redirect edges to source nodes of sync transitions to their respective target nodes
            if(syncEdges.get(targetNodeId)){
                const sourceNode = originalGraph.nodes.filter(node => node.id === sourceNodeId)[0];
                const targetNode = originalGraph.nodes.filter(node => node.id === syncEdges.get(targetNodeId))[0];

                const newEdge = new Edge([sourceNode, targetNode], {});
                for(const att of edge.attributes.values){
                    newEdge.attributes.set(att[0], att[1])
                }

                this.graph.addEdge(newEdge);
            } else // add all other edges
                this.graph.addEdge(edge);
        }

        console.log(toDot(this.graph))

        // parse attributes
        this.graph.nodes.forEach(async node => {
            for(const attribute of ['first_vloc', 'second_vloc', 'final_edge']) {
                const list = this.parseList(node.attributes.get(attribute as NodeAttributeKey.values) as string[]);
                node.attributes.set(attribute as NodeAttributeKey.values, list);
            }
            for(const attribute of ['clockval_1', 'clockval_2', 'first_intval', 'second_intval']) {
                const assignmentMap = this.parseAssignmentList(node.attributes.get(attribute as NodeAttributeKey.values) as string[]);
                node.attributes.set(attribute as NodeAttributeKey.values, assignmentMap);
            }
        })
        // set outgoing edge map
        this.graph.edges.forEach(edge => {
            const sourceNodeId = (edge.targets[0] as NodeModel).id
            if(!this.outgoingEdges.has(sourceNodeId)){
                this.outgoingEdges = this.outgoingEdges.set(sourceNodeId, [edge]);
            } else {
                let newEdgeList = this.outgoingEdges.get(sourceNodeId).concat(edge);
                this.outgoingEdges = this.outgoingEdges.set(sourceNodeId, newEdgeList)
            }
        })
    }

    getOutgoingEdges(node: NodeModel) {
        if(!this.outgoingEdges.has(node.id))
            return [];
        return this.outgoingEdges.get(node.id);
    }

    nodeToStateJSON(locs: string[], intvals: Map<string, string>, clockvals: Map<string, string>) {
        const vloc = ("<").concat(locs.join(",")).concat(">");
        
        let intval = "";
        for(const [lhs, rhs] of intvals)
            intval = intval.concat(lhs).concat("=").concat(rhs).concat(",");
        intval = intval.substring(0, intval.length - 1);

        let clockval = "";
        for(const [lhs, rhs] of clockvals) {

            let rhs_transformed = rhs;
            // transform .5 to /2
            if ((new RegExp(/^\d*(\.5(0)*)$/)).test(rhs_transformed)) {
                rhs_transformed = rhs_transformed.split(".")[0];
                rhs_transformed = (+rhs_transformed * 2 + 1).toString().concat("/2");
            }

            clockval = clockval.concat(lhs).concat("=").concat(rhs_transformed).concat(", ");
        }
        clockval = clockval.substring(0, clockval.length - 2);

        return {"intval": intval, "labels": "", "vloc": vloc, "clockval": clockval};
    }

    parseList(list: string[]) {

        let result = [];

        if (list === undefined)
            return result;

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
        result = cur? result.concat(cur) : result;
        return result;
    }

    parseAssignmentList(list: string[]) {

        const assignments = this.parseList(list)
        let result = new Map<string, string>()

        for(const assignment of assignments){

            let lhs = "";
            let cur = ""

            for(const c of assignment){
                if(c == "=") {
                    lhs = lhs.concat(cur);
                    cur = "";
                } else {
                    cur = cur.concat(c);
                }
            }
            result = result.set(lhs, cur)
        }

        // remove _1 and _2 suffix from clock names
        if(result.delete("Ref Clock")){
            for(const clockName of Array.from(result.keys())){
                let newName = "";

                if(clockName.includes("[")){ // clocks of size > 1
                    const idx = clockName.indexOf("[");
                    newName = clockName.substring(0, idx - 2).concat(clockName.substring(idx, clockName.length));
                }
                else { // clocks of size 1
                    newName = clockName.substring(0, clockName.length - 2);
                }

                result = result.set(newName, result.get(clockName));
                result.delete(clockName);
            }
        }

        return result;
    }

}
