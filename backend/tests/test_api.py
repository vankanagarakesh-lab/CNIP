"""Tests for FastAPI endpoints."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_simulate_api_endpoint_success():
    payload = {
        "transaction": {
            "sender_account": "DEMO-10001",
            "receiver_account": "DEMO-20002",
            "amount": 5000.0,
            "transaction_type": "Fund Transfer",
            "description": "Fee payment"
        },
        "framing_method": "CHARACTER_STUFFING",
        "crc_algorithm": "CRC_16",
        "inject_error": False
    }
    response = client.post("/api/simulations/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["final_status"] == "SUCCESSFUL"
    assert data["crc_verification_result"] == "PASS"
    assert len(data["steps"]) == 18

def test_simulate_api_endpoint_error_injection():
    payload = {
        "transaction": {
            "sender_account": "DEMO-10001",
            "receiver_account": "DEMO-20002",
            "amount": 2500.0,
            "transaction_type": "Fund Transfer",
            "description": "Library Fee"
        },
        "framing_method": "BIT_STUFFING",
        "crc_algorithm": "CRC_CCITT",
        "inject_error": True
    }
    response = client.post("/api/simulations/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["final_status"] == "REJECTED"
    assert data["crc_verification_result"] == "FAIL"

def test_dashboard_stats_endpoint():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_transactions" in data
    assert "successful_transmissions" in data
