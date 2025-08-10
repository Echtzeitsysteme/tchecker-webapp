import tempfile
import os
from typing import Optional
from fastapi import APIRouter, Body
from pydantic import BaseModel
import util.call_tchecker as call_tchecker
import asyncio

router = APIRouter(prefix="/tck_reach", tags=["tck_reach"])


class TckReachBody(BaseModel):
    sysdecl: str
    labels: str
    algorithm: int
    search_order: int
    certificate: int
    block_size: Optional[int] = None
    table_size: Optional[int] = None

@router.put("")
async def reach(body: TckReachBody = Body(...)):
    
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(body.sysdecl.encode('utf-8'))
        temp_file_path = temp_file.name
        
    print(temp_file_path)
    print(body.labels)

    output, result = call_tchecker.call_tchecker_function_in_new_process(
        func_name="tck_reach",
        argtypes=["ctypes.c_char_p", "ctypes.c_char_p", "ctypes.c_int", "ctypes.c_int", "ctypes.c_int", "ctypes.POINTER(ctypes.c_int)", "ctypes.POINTER(ctypes.c_int)"],
        has_result=True,
        args=[temp_file_path, body.labels, body.algorithm, body.search_order, body.certificate, body.block_size, body.table_size]
    )

    # Cleanup
    os.remove(temp_file_path)

    resultMap = {
        "stats": output,
        "certificate": result
    }
    print("Output: " + output)
    
    return resultMap
