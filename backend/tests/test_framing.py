"""Tests for Framing and Stuffing Algorithms."""

import pytest
from app.core.framing import (
    apply_character_framing, remove_character_framing,
    apply_character_stuffing, remove_character_stuffing,
    apply_bit_stuffing, remove_bit_stuffing,
    apply_framing, remove_framing
)

def test_character_framing_roundtrip():
    data = b"Hello, Bank Server! Transfer 5000 INR"
    framed = apply_character_framing(data)
    assert framed["header_hex"] == "0102" + len(data).to_bytes(2, 'big').hex().upper()
    assert framed["trailer_hex"] == "0304"
    
    ok, destuffed, err = remove_character_framing(framed["framed_bytes"])
    assert ok is True
    assert destuffed == data

def test_character_stuffing_roundtrip():
    # Data with embedded DLE (0x10) characters
    data = b"SECURE" + b"\x10" + b"BANK" + b"\x10\x10" + b"DATA"
    framed = apply_character_stuffing(data)
    assert framed["stuffed_count"] == 3 # three DLEs stuffed
    
    ok, destuffed, err = remove_character_stuffing(framed["framed_bytes"])
    assert ok is True
    assert destuffed == data

def test_bit_stuffing_roundtrip():
    # Data with sequence containing five 1s: 0b11111110 = 0xFE
    data = bytes([0xFE, 0xFF, 0x00, 0x1F, 0x3E, 0x7C])
    framed = apply_bit_stuffing(data)
    assert framed["stuffed_count"] > 0
    
    ok, destuffed, err = remove_bit_stuffing(framed["framed_bytes"])
    assert ok is True
    assert destuffed == data

def test_dispatch_framing_all_methods():
    sample = b"Test Payload 12345"
    methods = ["CHARACTER_FRAMING", "CHARACTER_STUFFING", "BIT_STUFFING"]
    for m in methods:
        framed = apply_framing(sample, m)
        ok, recovered, err = remove_framing(framed["framed_bytes"], m)
        assert ok is True, f"Failed for method {m}: {err}"
        assert recovered == sample
