import ctypes
import tempfile
from fastapi import APIRouter, Body
import util.cpp_interop_utility as cpp_util

router = APIRouter(prefix="/tck_syntax", tags=["tck_syntax"])

@router.put("/check")
def check(body: str = Body(...)):
    print("check")
    print(body)

    mylib = ctypes.CDLL("./libtchecker.so")

    mylib.tck_syntax.argtypes = [ctypes.c_char_p]
    mylib.tck_syntax.restype= ctypes.c_char_p


    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(body.encode('utf-8'))
        temp_file_path = temp_file.name
        char_array = ctypes.create_string_buffer(temp_file_path.encode('utf-8'))
        print(temp_file_path)
        stdout, result = cpp_util.capture_c_stdout(mylib.tck_syntax, char_array)
        # print("stdout")
        # print(stdout)
        return result.decode('utf-8')

    