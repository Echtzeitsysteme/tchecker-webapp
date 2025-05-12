import ctypes
import tempfile
import os
from typing import Optional
from fastapi import APIRouter, Body
from pydantic import BaseModel
import util.call_tchecker as call_tchecker

router = APIRouter(prefix="/tck_reach", tags=["tck_reach"])


class TckReachBody(BaseModel):
    ta: str
    algorithm: int
    search_order: int
    certificate: int
    block_size: Optional[int] = None
    table_size: Optional[int] = None

@router.put("/")
def reach(body: TckReachBody = Body(...)):
    
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(body.ta.encode('utf-8'))
        temp_file_path = temp_file.name
        
    print(temp_file_path)

    output, result = call_tchecker.call_tchecker_function_in_new_process(
        func_name="tck_reach",
        argtypes=["ctypes.c_char_p", "ctypes.c_int", "ctypes.c_int", "ctypes.c_int", "ctypes.c_int", "ctypes.c_int"],
        restype="ctypes.c_char_p",
        args=[temp_file_path, body.algorithm, body.search_order, body.certificate, body.block_size or 0, body.table_size or 0]
    )

    # Cleanup
    # os.remove(temp_file_path)
    
    resultMap = {
        "stats": output,
        "certificate": result
    }
    
    return resultMap
