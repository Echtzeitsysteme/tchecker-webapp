import tempfile
from typing import Optional
from fastapi import APIRouter, Body, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import util.call_tchecker as call_tchecker

router = APIRouter(prefix="/tck_simulate", tags=["tck_simulate"])


class TCKSimulationRequest(BaseModel):
    sysdecl: str
    simulation_type: int
    starting_state: Optional[str] = None
    nsteps: Optional[int] = None


@router.put("/simulate")
async def simulate_tck(
    body: TCKSimulationRequest = Body(..., description="Request body for TCK simulation")
):
    if not body.sysdecl:
        raise HTTPException(status_code=422, detail="sysdecl cannot be empty")

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(body.sysdecl.encode('utf-8'))
        temp_file_path = temp_file.name

    # Call the TChecker simulation function with following definition:
    # void tck_simulate(const char * output_filename, const char * sysdecl_filename, simulation_type_t simulation_type,
    #                   const tchecker::simulate::display_type_t display_type, const char * starting_state_attributes, int nsteps,
    #                   bool output_trace);  
    # output_filename is set by the call function when has_result=True

    output, result = call_tchecker.call_tchecker_function_in_new_process(
        func_name="tck_simulate",
        argtypes=["ctypes.c_char_p", "ctypes.c_int", "ctypes.c_int", "ctypes.c_char_p", "ctypes.POINTER(ctypes.c_int)", "ctypes.c_bool"],
        has_result=True,
        args=[temp_file_path, body.simulation_type, 1, body.starting_state or "", body.nsteps or 0, False] 
    )
    #remove last newline character and quotes from result
    result = result.strip()

    print("Output: " + output)
    print("Result: " + result)


    return Response(content=result, media_type="application/json")


    
