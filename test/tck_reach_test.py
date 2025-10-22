import os
from fastapi.testclient import TestClient
from backend.app import app

# load valid timed automaton from file
with open(os.path.join(os.path.dirname(__file__), "ta_files/valid_ta_example.tck"), "r") as file:
    sysdecl = file.read()

client = TestClient(app)

# reach test
def test_reach_empty_request():
    response = client.put("/tck_reach", json={})
    assert response.status_code == 422, "Expected validation error for empty request body"

def test_reach_valid_request():
    
    body = {
        "sysdecl": sysdecl,
        "labels": [],
        "search_order": "bfs",
        "algorithm": 0,
        "certificate": 0,
    }

    response = client.put("/tck_reach", json=body)
    assert response.status_code == 200, "Expected successful reach check for valid request"
    assert "REACHABLE false" in response.text, "Expected result in response for valid reachability check"
    