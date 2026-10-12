"""Tests for AES-256-GCM authenticated encryption and decryption."""

import pytest
from app.core.encryption import encrypt_transaction, decrypt_transaction

def test_aes_encryption_and_decryption_success():
    tx_data = {
        "transaction_id": "TXN-TEST01",
        "sender_account": "DEMO-10001",
        "receiver_account": "DEMO-20002",
        "amount": 5000.0,
        "currency": "INR",
        "transaction_type": "Fund Transfer",
        "description": "Fee payment"
    }
    
    enc = encrypt_transaction(tx_data)
    assert enc["algorithm"] == "AES-256-GCM"
    assert enc["key_size_bits"] == 256
    assert enc["nonce_size_bits"] == 96
    assert enc["tag_size_bits"] == 128
    assert len(enc["nonce_hex"]) == 24 # 12 bytes = 24 hex chars
    assert len(enc["tag_hex"]) == 32   # 16 bytes = 32 hex chars
    assert len(enc["ciphertext_hex"]) > 0
    
    # Decrypt
    ok, dec_data, err = decrypt_transaction(enc["payload_bytes"])
    assert ok is True
    assert err == ""
    assert dec_data["transaction_id"] == "TXN-TEST01"
    assert dec_data["sender_account"] == "DEMO-10001"
    assert dec_data["amount"] == 5000.0

def test_aes_tampering_fails_decryption():
    tx_data = {"transaction_id": "TXN-TAMPER", "amount": 1000.0}
    enc = encrypt_transaction(tx_data)
    
    # Tamper with 1 byte of payload
    payload_bytearray = bytearray(enc["payload_bytes"])
    payload_bytearray[-1] ^= 0xFF
    tampered_payload = bytes(payload_bytearray)
    
    ok, dec_data, err = decrypt_transaction(tampered_payload)
    assert ok is False
    assert "Failed" in err or "Authentication" in err

def test_fresh_nonce_per_encryption():
    tx = {"amount": 100}
    enc1 = encrypt_transaction(tx)
    enc2 = encrypt_transaction(tx)
    assert enc1["nonce_hex"] != enc2["nonce_hex"]
    assert enc1["ciphertext_hex"] != enc2["ciphertext_hex"]
