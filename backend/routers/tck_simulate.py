import tempfile
from typing import Optional
from fastapi import APIRouter, Body, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import util.call_tchecker as call_tchecker

router = APIRouter(prefix="/tck_simulate", tags=["tck_simulate"])


class TCKSimulationRequest(BaseModel):
    sysdecl: str
    starting_state: Optional[str] = None


@router.put("/simulate")
async def simulate_tck(
    body: TCKSimulationRequest = Body(..., description="Request body for TCK simulation")
):
    if not body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(body.sysdecl.encode('utf-8'))
        temp_file_path = temp_file.name

    output, result = call_tchecker.call_tchecker_function_in_new_process(
        func_name="tck_simulate_onestep_simulation",
        argtypes=["ctypes.c_char_p", "ctypes.c_int", "ctypes.c_char_p"],
        has_result=True,
        args=[temp_file_path, 1, body.starting_state or ""] 
    )
    #remove last newline character and quotes from result
    result = result.strip()

    print("Output: " + output)
    print("Result: " + result)


    return Response(content=result, media_type="application/json")


    
