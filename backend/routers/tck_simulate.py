from fastapi import APIRouter, Body, HTTPException, Response
from pydantic import BaseModel
from tcheckerpy.tools import tck_simulate

router = APIRouter(prefix="/tck_simulate", tags=["tck_simulate"])

class TCKSimulationRequestOneStep(BaseModel): # for both concrete and symbolic simulation
    sysdecl: str
    starting_state: str | None = None

class TCKSimulationRequestRandomized(BaseModel): # for both concrete and symbolic simulation
    sysdecl: str
    starting_state: str | None = None
    nsteps: int | None = None

@router.put("/one_step_simulation")
async def one_step_simulation(
    body: TCKSimulationRequestOneStep = Body(..., description="Request body for TCK simulation")
):
    if not body or not body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    result = tck_simulate.one_step_simulation(body.sysdecl, starting_state=body.starting_state)

    return Response(content=result, media_type="application/json")

@router.put("/randomized_simulation")
async def randomized_simulation(
    body: TCKSimulationRequestRandomized = Body(..., description="Request body for TCK simulation")
):
    if not body or not body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    result = tck_simulate.randomized_simulation(body.sysdecl, nsteps=body.nsteps, starting_state=body.starting_state)

    return Response(content=result, media_type="application/json")

@router.put("/concrete_one_step_simulation")
async def concrete_one_step_simulation(
    body: TCKSimulationRequestOneStep = Body(..., description="Request body for TCK simulation")
):
    if not body or not body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    result = tck_simulate.concrete_one_step_simulation(body.sysdecl, starting_state=body.starting_state)

    return Response(content=result, media_type="application/json")

@router.put("/concrete_randomized_simulation")
async def concrete_randomized_simulation(
    body: TCKSimulationRequestRandomized = Body(..., description="Request body for TCK simulation")
):
    if not body or not body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    result = tck_simulate.concrete_randomized_simulation(body.sysdecl, nsteps=body.nsteps, starting_state=body.starting_state)

    return Response(content=result, media_type="application/json")
    