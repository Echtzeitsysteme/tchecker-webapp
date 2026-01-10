import { EdgeModel, NodeModel, RootGraphModel } from 'ts-graphviz';

export function getEdgeAsString(edge: EdgeModel, graph: RootGraphModel, first: boolean) {

    let action = edge.attributes.get(first ? "first_vedge" : "second_vedge") || "";
    if(action === "")
        return ("Delay of ").concat(edge.attributes.get("delay").toString()).concat("");

    action = ("Action: ").concat(action);

    let guard = edge.attributes.get(first ? "first_vedge_prov" : "second_vedge_prov") || "";
    guard = (" Provided: <").concat(guard);

    let resets = edge.attributes.get(first ? "first_vedge_do" : "second_vedge_do") || "";
    resets = ("> Do: <").concat(resets);

    const target = edge.targets[1] as NodeModel;
    const targetNode = graph.nodes.filter(node => node.id === target.id)[0];
    let targetLoc = targetNode.attributes.get(first ? "first_vloc" : "second_vloc").join();
    targetLoc = ("> Target location: <").concat(targetLoc);

    return action.concat(guard).concat(resets).concat(targetLoc).concat(">");
}