import subprocess
import os
import uuid
from typing import Dict, TypedDict
import platform
import sys

# Importuj resource tylko na Unixach
if platform.system() != "Windows":
    import resource
else:
    resource = None

class TestCaseResult(TypedDict):
    status: str
    message: str

class TestResults(TypedDict):
    status: str
    tests: Dict[str, TestCaseResult]

TestResult = TestResults

# Constants for limits
MAX_EXECUTION_TIME = 2  # seconds
MAX_MEMORY_LIMIT = 50 * 1024 * 1024  # 50MB in bytes
MAX_CODE_LENGTH = 10000  # characters

def set_resource_limits():
    """Set resource limits for the child process"""
    if resource is None:
        return  # Brak resource na Windows
    try:
        resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMORY_LIMIT, MAX_MEMORY_LIMIT))
        resource.setrlimit(resource.RLIMIT_CPU, (MAX_EXECUTION_TIME, MAX_EXECUTION_TIME))
    except (ValueError, resource.error) as e:
        print(f"Warning: Could not set resource limits: {e}", file=sys.stderr)


def parse_test_output(output: str) -> Dict:
    """
    Parse the structured test output into a dictionary.
    Example output:
    TEST_1_STATUS=PASS
    TEST_1_MESSAGE=
    TEST_2_STATUS=FAIL
    TEST_2_MESSAGE=Expected [1, 2], Got [0, 0]
    """
    lines = output.strip().split('\n')
    result = {}
    
    for line in lines:
        if not line:
            continue
            
        if '=' not in line:
            continue
            
        key, value = line.split('=', 1)
        if key.startswith('TEST_') and key.endswith('_STATUS'):
            test_num = key[5:-7]  # Extract test number
            if test_num not in result:
                result[test_num] = {}
            result[test_num]['status'] = value
        elif key.startswith('TEST_') and key.endswith('_MESSAGE'):
            test_num = key[5:-8]  # Extract test number
            if test_num not in result:
                result[test_num] = {}
            result[test_num]['message'] = value
    
    return result

def execute_submission(
    user_code: str, runner_file_path: str, timeout: int = MAX_EXECUTION_TIME
) -> TestResult:
    """
    Reads a specific C runner file, injects user code, compiles, and runs.

    Args:
        user_code: The C code submitted by the user.
        runner_file_path: Path to the problem-specific C test file.
        timeout: Execution timeout in seconds.

    Returns:
        A dictionary containing the status and test results.
    """
    # Basic validation
    if not user_code or not isinstance(user_code, str):
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": "Invalid code submission."
                }
            }
        }

    if len(user_code) > MAX_CODE_LENGTH:
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters."
                }
            }
        }

    if not os.path.exists(runner_file_path):
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": "Runner file not found."
                }
            }
        }

    try:
        with open(runner_file_path, "r") as f:
            harness_code = f.read()
    except IOError as e:
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": f"Error reading runner file: {str(e)}"
                }
            }
        }

    if "{user_code}" not in harness_code:
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": "Placeholder {user_code} not in runner file."
                }
            }
        }

    full_code = harness_code.replace("{user_code}", user_code)

    temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "problem_tests")

    base_name = f"temp_{uuid.uuid4().hex}"
    source_file = os.path.join(temp_dir, f"{base_name}.c")
    executable_file = os.path.join(temp_dir, f"{base_name}.out")

    try:
        with open(source_file, "w") as f:
            f.write(full_code)

        compile_proc = subprocess.run(
            ["gcc", source_file, "-o", executable_file],
            capture_output=True,
            text=True,
        )
        if compile_proc.returncode != 0:
            return {
                "status": "compilation_error",
                "tests": {
                    "1": {
                        "status": "ERROR",
                        "message": compile_proc.stderr
                    }
                }
            }

        run_proc = subprocess.run(
            [executable_file],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
            preexec_fn=set_resource_limits if platform.system() != 'Windows' else None
        )
        
        test_results = parse_test_output(run_proc.stdout)
        
        if test_results:
            return {
                "status": "success" if run_proc.returncode == 0 else "test_failed",
                "tests": test_results
            }
        
        if run_proc.stderr:
            return {
                "status": "runtime_error",
                "tests": {
                    "1": {
                        "status": "ERROR",
                        "message": run_proc.stderr
                    }
                }
            }
        
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": "Unexpected program behavior"
                }
            }
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "timeout",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": f"Execution timed out after {timeout} seconds."
                }
            }
        }
    except MemoryError:
        return {
            "status": "memory_error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": f"Memory limit exceeded ({MAX_MEMORY_LIMIT/1024/1024}MB)"
                }
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "tests": {
                "1": {
                    "status": "ERROR",
                    "message": f"Unexpected error: {str(e)}"
                }
            }
        }
    finally:
        # Cleanup
        try:
            if os.path.exists(source_file):
                os.remove(source_file)
            if os.path.exists(executable_file):
                os.remove(executable_file)
        except Exception as e:
            print(f"Warning: Error during cleanup: {e}", file=sys.stderr)
