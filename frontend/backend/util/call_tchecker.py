import subprocess
import sys
import json
import ast
from typing import List, Tuple, Any

def call_tchecker_function_in_new_process(
    func_name: str,
    argtypes: List[str],
    restype: str,
    args: List[Any],
    lib_path: str = "./libtchecker.so",
    caller_script: str = "./util/tchecker_caller.py"
) -> Tuple[str, Any]:
    """
    Calls a function in a fresh Python subprocess by invoking tchecker_caller.py.

    Returns stdout_output (everything before the final line)
    and result (parsed from the final line).
    """
    args_json     = json.dumps(args)
    argtypes_json = json.dumps(argtypes)

    cmd = [
        sys.executable,
        caller_script,
        "--lib-path", lib_path,
        "--func-name", func_name,
        "--argtypes", argtypes_json,
        "--restype", restype,
        "--args", args_json,
    ]

    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True
    )
    if proc.returncode != 0:
        print(f"Error calling tchecker function: {proc.stderr.strip()}")
        raise RuntimeError(f"Child process failed:\n{proc.stderr.strip()}")

    # split printed C‑stdout vs our result
    lines = proc.stdout.splitlines()
    if lines:
        raw_result_line = lines[-1]
        stdout_output   = "\n".join(lines[:-1])
        try:
            result = ast.literal_eval(raw_result_line)
        except Exception:
            result = raw_result_line
    else:
        stdout_output = ""
        result        = None

    return stdout_output, result