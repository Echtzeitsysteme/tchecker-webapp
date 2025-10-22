import os
from fastapi.testclient import TestClient
from backend.app import app

# load valid timed automaton from file
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_ta_example.tck"), "r") as file:
    sysdecl = file.read()

client = TestClient(app)

# liveness test
def test_liveness_empty_request():
    response = client.put("/tck_liveness", json={})
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_liveness_valid_request():

    body = {
        "sysdecl": sysdecl,
        "labels": [],
        "algorithm": 0,
        "certificate": 0,
    }

    response = client.put("/tck_liveness", json=body)
    assert response.status_code == 200, "Expected successful liveness check for valid request"
    assert "CYCLE false" in response.text, "Expected result in response for valid liveness check"