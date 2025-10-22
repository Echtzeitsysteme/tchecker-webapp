import os
from fastapi.testclient import TestClient
from backend.app import app

# load two valid timed automata from files
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_ta_example.tck"), "r") as file:
    sysdecl = file.read()

client = TestClient(app)

# compare test
def test_compare_empty_request():
    response = client.put("/tck_compare", json={})
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_compare_valid_request():

    body = {
        "first_sysdecl": sysdecl,
        "second_sysdecl": sysdecl,
        "relationship": 0,
        "generate_witness": False
    }

    response = client.put("/tck_compare", json=body)
    assert response.status_code == 200, "Expected successful comparison for valid request"
    assert "RELATIONSHIP_FULFILLED true" in response.text, "Expected result in response for valid comparison"
