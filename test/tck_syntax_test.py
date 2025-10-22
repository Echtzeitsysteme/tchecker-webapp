import os
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

# load test objects and expected results from respective file
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_ta_example.tck"), "r") as file:
    sysdecl_valid = file.read()
with open(os.path.join(os.path.dirname(__file__), "ta_files/invalid_ta_example.tck"), "r") as file:
    sysdecl_invalid = file.read()
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_ta_example.dot"), "r") as file:
    expected_dot = file.read()
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_ta_example.json"), "r") as file:
    expected_json = file.read()
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_product_ta_example.tck"), "r") as file:
    expected_product = file.read()

# syntax check tests
def test_syntax_check_empty_request():

    response = client.put("/tck_syntax/check", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_syntax_check_valid_request():
    
    response = client.put("/tck_syntax/check", json=sysdecl_valid)
    assert response.status_code == 200, "Expected successful syntax check for valid request"
    assert "error" not in response.json(), "Expected no error message in response for valid syntax"
    
def test_syntax_check_invalid_request():

    response = client.put("/tck_syntax/check", json=sysdecl_invalid)
    assert response.status_code == 200, "Failed syntax check should not throw exception"
    assert response.json()["status"] == "error", "Expected error message in response"

# to_dot tests
def test_syntax_to_dot_empty_request():

    response = client.put("/tck_syntax/to_dot", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_syntax_to_dot_valid_request():

    response = client.put("/tck_syntax/to_dot", json=sysdecl_valid)
    assert response.status_code == 200, "Expected successful conversion to DOT format for valid request"
    assert response.json() == expected_dot, "Expected DOT format to match the expected output"

# to_json tests
def test_syntax_to_json_empty_request():

    response = client.put("/tck_syntax/to_json", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_syntax_to_json_valid_request():

    response = client.put("/tck_syntax/to_json", json=sysdecl_valid)
    assert response.status_code == 200, "Expected successful conversion to JSON format for valid request"
    assert response.json() == expected_json, "Expected JSON format to match the expected output"

# Create synchronized product tests
def test_create_synchronized_product_empty_request():

    response = client.put("/tck_syntax/create_synchronized_product", json="")
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_create_synchronized_product_valid_request():

    body = {
        "sysdecl": sysdecl_valid,
        "process_name": "init_System"
    }
    
    response = client.put("/tck_syntax/create_synchronized_product", json=body)
    assert response.status_code == 200, "Expected successful creation of synchronized product for valid request"
    assert response.json() == expected_product, "Expected synchronized product to match the expected output"
