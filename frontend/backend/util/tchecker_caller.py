#!/usr/bin/env python3
import ctypes
import json
import argparse
import ast
import sys

def main():
    parser = argparse.ArgumentParser(
        description="Load a shared library, call one function, and print its return value"
    )
    parser.add_argument(
        "--lib-path", "-L",
        required=True,
        help="Path to the shared library (e.g. ./libtchecker.so)"
    )
    parser.add_argument(
        "--func-name", "-f",
        required=True,
        help="Name of the exported function to call"
    )
    parser.add_argument(
        "--argtypes", "-a",
        required=True,
        help="JSON‑encoded list of ctypes type names, e.g. '[\"ctypes.c_int\", \"ctypes.c_double\"]'"
    )
    parser.add_argument(
        "--restype", "-r",
        required=True,
        help="ctypes type name for the return value, or 'None' for void"
    )
    parser.add_argument(
        "--args", "-A",
        required=True,
        help="JSON‑encoded list of argument values"
    )
    opts = parser.parse_args()

    # 1) load the library
    dll = ctypes.CDLL(opts.lib_path)

    # 2) grab the function
    func = getattr(dll, opts.func_name)

    # 3) set its signature
    argtypes = json.loads(opts.argtypes)
    func.argtypes = [eval(t) for t in argtypes]
    func.restype  = None if opts.restype == "None" else ctypes.c_void_p

    # 4) parse our JSON args
    py_args = json.loads(opts.args)

    for idx, at in enumerate(func.argtypes):
        if at is ctypes.c_char_p:
            val = py_args[idx]
            if isinstance(val, str):
                py_args[idx] = val.encode('utf-8')

    # 5) call it (any C‑side prints still go to stdout)
    result = func(*py_args)

    string_result = ctypes.cast(result, ctypes.c_char_p).value

    # free the C‑side memory if needed
    if func.restype is ctypes.c_char_p:    
        dll.free_string(ctypes.c_char_p(result))

    
    sys.stdout.write(repr(string_result))

if __name__ == "__main__":
    main()
