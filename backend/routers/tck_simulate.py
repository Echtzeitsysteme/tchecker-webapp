from fastapi import APIRouter, Body, HTTPException, Response
from pydantic import BaseModel
from tcheckerpy.tools import tck_simulate

router = APIRouter(prefix="/tck_simulate", tags=["tck_simulate"])

class TCKSimulationRequestOneStep(BaseModel):
    sysdecl: str
    starting_state: str | None = None

class TCKSimulationRequestRandomized(BaseModel):
    sysdecl: str
    starting_state: str | None = None
    nsteps: int | None = None

@router.put("/one_step")
async def one_step_simulation(
    body: TCKSimulationRequestOneStep = Body(..., description="Request body for TCK simulation")
):
    if not body or body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    result = tck_simulate.one_step_simulation(body.sysdecl, starting_state=body.starting_state)

    return Response(content=result, media_type="application/json")

@router.put("/randomized")
async def randomized_simulation(
    body: TCKSimulationRequestRandomized = Body(..., description="Request body for TCK simulation")
):
    if not body or body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    result = tck_simulate.randomized_simulation(body.sysdecl, nsteps=body.nsteps, starting_state=body.starting_state)

    return Response(content=result, media_type="application/json")
    