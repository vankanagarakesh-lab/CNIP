"""Tests for end-to-end simulator workflow."""

import pytest
from app.core.simulator import run_transmission_simulation

def test_simulator_successful_path():
    tx = {
        "sender_account": "DEMO-10001",
        "receiver_account": "DEMO-20002",
        "amount": 5000.0,
        "transaction_type": "Fund Transfer",
        "description": "College Fee Payment"
    }
    
    result = run_transmission_simulation(
        transaction_data=tx,
        framing_method="CHARACTER_STUFFING",
        crc_algorithm="CRC_16",
        inject_error=False
    )
    
    assert result["final_status"] == "SUCCESSFUL"
    assert result["crc_verification_result"] == "PASS"
    assert result["error_injected"] is False
    assert result["recovered_transaction"] is not None
    assert result["recovered_transaction"]["amount"] == 5000.0
    assert result["recovered_transaction"]["sender_account"] == "DEMO-10001"
    assert len(result["steps"]) == 18 # Complete 18-stage workflow

def test_simulator_error_injected_path():
    tx = {
        "sender_account": "DEMO-10001",
        "receiver_account": "DEMO-20002",
        "amount": 7500.0,
        "transaction_type": "Fund Transfer",
        "description": "Tuition Fee"
    }
    
    result = run_transmission_simulation(
        transaction_data=tx,
        framing_method="BIT_STUFFING",
        crc_algorithm="CRC_CCITT",
        inject_error=True
    )
    
    assert result["final_status"] == "REJECTED"
    assert result["crc_verification_result"] == "FAIL"
    assert result["error_injected"] is True
    assert result["recovered_transaction"] is None
    assert "DATA INTEGRITY ERROR" in result["failure_reason"]
    # Should stop at step 15 (CRC verification fail & reject)
    assert len(result["steps"]) == 15

def test_all_framing_and_crc_permutations():
    tx = {"sender_account": "DEMO-1", "receiver_account": "DEMO-2", "amount": 100.0}
    framing_options = ["CHARACTER_FRAMING", "CHARACTER_STUFFING", "BIT_STUFFING"]
    crc_options = ["CRC_12", "CRC_16", "CRC_CCITT"]
    
    for f in framing_options:
        for c in crc_options:
            res = run_transmission_simulation(tx, framing_method=f, crc_algorithm=c, inject_error=False)
            assert res["final_status"] == "SUCCESSFUL", f"Failed for {f} + {c}"
            assert res["recovered_transaction"]["amount"] == 100.0
