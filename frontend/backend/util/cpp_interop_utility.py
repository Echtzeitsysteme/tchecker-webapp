import os
import sys
import ctypes

def capture_c_stdout(func, *args, **kwargs):
    # Save the original stdout file descriptor
    original_stdout_fd = sys.__stdout__.fileno()
    
    # Create a pipe
    read_fd, write_fd = os.pipe()
    
    # Flush Python and C-level stdout
    sys.stdout.flush()
    sys.stderr.flush()
    os.dup2(write_fd, original_stdout_fd)
    
    # Call the C++ function
    try:
        result = func(*args, **kwargs)
    finally:
        # Restore the original stdout
        os.dup2(sys.__stdout__.fileno(), write_fd)
        os.close(write_fd)

    print("reading")

    # Read from the pipe
    output = os.read(read_fd, 10000).decode()
    os.close(read_fd)
    
    return output, result