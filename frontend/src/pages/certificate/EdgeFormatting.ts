export function getEdgeAsString(edge: {transition: any; target: any}) {

    if(edge.transition.delay)
        return ("Delay of ").concat(edge.transition.delay);

    const action = ("Action: ").concat(edge.transition.vedge);
    const guard = (" Provided: <").concat(edge.transition.guard || "");
    const resets = ("> Do: <").concat(edge.transition.reset || "");

    const targetLoc = ("> Target State: <Loc: ").concat(edge.target.vloc);
    const targetIntVal = (" Intval: <").concat(edge.target.intval || "");
    const targetClockVal = ("> Clockval: <").concat(edge.target.clockval || "");

    return action.concat(guard).concat(resets).concat(targetLoc).concat(targetIntVal).concat(targetClockVal).concat(">>");
}