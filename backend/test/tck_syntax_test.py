import sys
import os

# Ensure the parent directory is in the path to import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app 

client = TestClient(app)

# Syntax check tests
def test_syntax_check_empty_request():
    response = client.put("/tck_syntax/check", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_syntax_check_valid_request():
    # Load a valid timed automaton from file
    body = ""
    with open("test/valid_ta_example.tck", "r") as file:
        body = file.read()
    response = client.put("/tck_syntax/check", json=body)
    assert response.status_code == 200, "Expected successful syntax check for valid request"
    assert "error" not in response.json(), "Expected no error message in response for valid syntax"
    

def test_syntax_check_invalid_request():
    # Load an invalid timed automaton from file
    body = ""
    with open("test/invalid_ta_example.tck", "r") as file:
        body = file.read()
    response = client.put("/tck_syntax/check", json=body)
    assert response.status_code == 200, "Expected error for invalid syntax in timed automaton"
    assert "error" in response.json(), "Expected error message in response"


# to_dot tests
def test_syntax_to_dot_empty_request():
    response = client.put("/tck_syntax/to_dot", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_syntax_to_dot_valid_request():
    # Load a valid timed automaton from file
    body = ""
    with open("test/valid_ta_example.tck", "r") as file:
        body = file.read()
    response = client.put("/tck_syntax/to_dot", json=body)
    assert response.status_code == 200, "Expected successful conversion to DOT format for valid request"

    # Load expected DOT format from file
    expected_dot = ""
    with open("test/valid_ta_example.dot", "r") as file:
        expected_dot = file.read()

    assert response.json() == expected_dot, "Expected DOT format to match the expected output"

def test_syntax_to_dot_invalid_request():
    # Load an invalid timed automaton from file
    body = ""
    with open("test/invalid_ta_example.tck", "r") as file:
        body = file.read()
    response = client.put("/tck_syntax/to_dot", json=body)
    assert response.status_code == 200, "Expected error for invalid syntax in timed automaton"

    print(response.json())
    assert "error" in response.json(), "Expected error message in response for invalid syntax"


# to_json tests
def test_syntax_to_json_empty_request():
    response = client.put("/tck_syntax/to_json", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_syntax_to_json_valid_request():
    # Load a valid timed automaton from file
    body = ""
    with open("test/valid_ta_example.tck", "r") as file:
        body = file.read()
    response = client.put("/tck_syntax/to_json", json=body)
    assert response.status_code == 200, "Expected successful conversion to JSON format for valid request"

    # Load expected JSON format from file
    expected_json = ""
    with open("test/valid_ta_example.json", "r") as file:
        expected_json = file.read()

    assert response.json() == expected_json, "Expected JSON format to match the expected output"

def test_syntax_to_json_invalid_request():
    # Load an invalid timed automaton from file
    body = ""
    with open("test/invalid_ta_example.tck", "r") as file:
        body = file.read()
    response = client.put("/tck_syntax/to_json", json=body)
    assert response.status_code == 200, "Expected error for invalid syntax in timed automaton"
    assert "error" in response.json(), "Expected error message in response for invalid syntax"

# Create synchronized product tests
def test_create_synchronized_product_empty_request():
    response = client.put("/tck_syntax/create_synchronized_product", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_create_synchronized_product_valid_request():
    body = {
        "ta": "",
        "process_name": "init_System"
    }
    with open("test/valid_ta_example.tck", "r") as file:
        body["ta"] = file.read()
    
    response = client.put("/tck_syntax/create_synchronized_product", json=body)
    assert response.status_code == 200, "Expected successful creation of synchronized product for valid request"

    # Load expected JSON format from file
    expected_json = ""
    with open("test/valid_ta_example.json", "r") as file:
        expected_json = file.read()

    print(response.json())

    assert response.json() == expected_json, "Expected synchronized product to match the expected output"

def test_create_synchronized_product_invalid_request():
    body = {
        "ta": "",
        "process_name": "test_process"
    }
    with open("test/invalid_ta_example.tck", "r") as file:
        body["ta"] = file.read()
    
    response = client.put("/tck_syntax/create_synchronized_product", json=body)
    assert response.status_code == 200, "Expected error for invalid syntax in timed automaton"
    assert "error" in response.json(), "Expected error message in response for invalid syntax"