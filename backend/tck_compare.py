import ctypes
import tempfile
import os
from typing import Optional
from fastapi import APIRouter, Body
from pydantic import BaseModel
import util.call_tchecker as call_tchecker

router = APIRouter(prefix="/tck_compare", tags=["tck_compare"])


class TckCompareBody(BaseModel):
    first_ta: str
    second_ta: str
    relationship: int
    block_size: Optional[int] = None
    table_size: Optional[int] = None

@router.put("/")
def reach(body: TckCompareBody = Body(...)):
    
    with tempfile.NamedTemporaryFile(delete=False) as temp_file_first_ta:
        temp_file_first_ta.write(body.first_ta.encode('utf-8'))
        temp_file_path_first_ta = temp_file_first_ta.name
    with tempfile.NamedTemporaryFile(delete=False) as temp_file_second_ta:
        temp_file_second_ta.write(body.second_ta.encode('utf-8'))
        temp_file_path_second_ta  = temp_file_second_ta.name
        
    
    output, result = call_tchecker.call_tchecker_function_in_new_process(
        func_name="tck_compare",
        argtypes=["ctypes.c_char_p", "ctypes.c_char_p", "ctypes.c_int", "ctypes.POINTER(ctypes.c_int)", "ctypes.POINTER(ctypes.c_int)"],
        has_result=True,
        args=[temp_file_path_first_ta, temp_file_path_second_ta, body.relationship, body.block_size, body.table_size]
    )

    # Cleanup
    os.remove(temp_file_path_first_ta)
    os.remove(temp_file_path_second_ta)

    resultMap = {
        "stats": output,
    }
    print("Output: " + output)
    
    return resultMap
