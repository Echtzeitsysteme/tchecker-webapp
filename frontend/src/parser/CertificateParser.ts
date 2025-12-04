import { fromDot, EdgeModel, NodeModel, RootGraphModel, EdgeAttributeKey, NodeAttributeKey } from 'ts-graphviz';
import './custom-attributes.d.ts'

export class Certificate {

    readonly graph: RootGraphModel;
    private outgoingEdges = new Map<NodeModel, EdgeModel[]>();

    constructor(dot: string) {

        // console.log(dot)

        this.graph = fromDot(dot);

        // parse attributes
        this.graph.edges.forEach(async edge => {
            for(const attribute of ['first_vedge', 'first_vedge_do', 'first_vedge_prov', 'second_vedge', 'second_vedge_do', 'second_vedge_prov']) {
                const list = this.parseList(edge.attributes.get(attribute as EdgeAttributeKey.values) as string[]);
                edge.attributes.set(attribute as EdgeAttributeKey.values, list);
            }
        })
        this.graph.nodes.forEach(async node => {
            for(const attribute of ['first_vloc', 'second_vloc']) {
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
            if(!this.outgoingEdges.has(edge.targets[0] as NodeModel)){
                this.outgoingEdges = this.outgoingEdges.set(edge.targets[0] as NodeModel, [edge]);
            } else {
                let newEdgeList = this.outgoingEdges.get(edge.targets[0] as NodeModel).concat(edge);
                this.outgoingEdges = this.outgoingEdges.set(edge.targets[0] as NodeModel, newEdgeList)
            }
        })
    }

    getOutgoingEdges(node: NodeModel) {
        if(!this.outgoingEdges.has(node))
            return [];
        return this.outgoingEdges.get(node);
    }

    private parseList(list: string[]) {

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
        result = cur? result.concat(cur) : result;
        return result;
    }

    private parseAssignmentList(list: string[]) {

        const assignments = this.parseList(list)
        let result = new Map<string, string>()

        for(const assignment of assignments){

            let lhs = "";
            let cur = ""

            for(const c of assignment){
                if(c == "=") {
                    lhs = lhs.concat(cur.substring(0, cur.length - 2));
                    cur = "";
                } else {
                    cur = cur.concat(c);
                }
            }
            result = result.set(lhs, cur)
        }

        return result;
    }

}
