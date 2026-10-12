"""Tests for CRC-12, CRC-16, and CRC-CCITT calculations & verifications."""

import pytest
from app.core.crc import calculate_crc, verify_crc
from app.core.error_injection import inject_bit_error

def test_crc_calculation_and_verification_crc16():
    data = b"Bank Transaction Packet Payload #12345"
    calc = calculate_crc(data, "CRC_16")
    assert calc["degree"] == 16
    assert len(calc["crc_hex"]) == 4
    assert len(calc["crc_bin"]) == 16
    assert len(calc["calculation_trace"]) > 0
    
    # Verify clean data
    is_valid, details = verify_crc(data, calc["crc_hex"], "CRC_16")
    assert is_valid is True
    assert details["status"] == "PASS"

def test_crc_calculation_and_verification_crc12():
    data = b"Bank Payload CRC-12 test"
    calc = calculate_crc(data, "CRC_12")
    assert calc["degree"] == 12
    assert len(calc["crc_hex"]) == 3
    assert len(calc["crc_bin"]) == 12
    
    is_valid, details = verify_crc(data, calc["crc_hex"], "CRC_12")
    assert is_valid is True
    assert details["status"] == "PASS"

def test_crc_calculation_and_verification_crcccitt():
    data = b"Bank Payload CRC-CCITT test"
    calc = calculate_crc(data, "CRC_CCITT")
    assert calc["degree"] == 16
    
    is_valid, details = verify_crc(data, calc["crc_hex"], "CRC_CCITT")
    assert is_valid is True
    assert details["status"] == "PASS"

def test_error_injection_causes_crc_failure():
    data = b"Sensitive Bank Transfer 50000 INR"
    calc = calculate_crc(data, "CRC_16")
    
    # Inject bit error
    corrupted_data, error_meta = inject_bit_error(data, bit_position=20)
    assert corrupted_data != data
    assert error_meta["error_injected"] is True
    
    # Verify corrupted data against original CRC
    is_valid, details = verify_crc(corrupted_data, calc["crc_hex"], "CRC_16")
    assert is_valid is False
    assert details["status"] == "FAIL"
