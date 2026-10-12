"""Standalone algorithm endpoints for direct educational testing and interactive calculations."""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.encryption import encrypt_transaction, decrypt_transaction
from ..core.framing import apply_framing, remove_framing
from ..core.crc import calculate_crc, verify_crc, CRC_DEFINITIONS

router = APIRouter(prefix="/api/algorithms", tags=["Algorithms"])

class EncryptRequest(BaseModel):
    transaction: Dict[str, Any]

class FrameRequest(BaseModel):
    payload_hex: str
    method: str = "CHARACTER_STUFFING"

class CrcRequest(BaseModel):
    data_hex: str
    algorithm: str = "CRC_16"

class VerifyCrcRequest(BaseModel):
    data_hex: str
    crc_hex: str
    algorithm: str = "CRC_16"

class DecryptRequest(BaseModel):
    payload_hex: str

@router.post("/encrypt")
def api_encrypt(req: EncryptRequest):
    try:
        res = encrypt_transaction(req.transaction)
        # remove raw bytes from JSON output
        res_clean = {k: v for k, v in res.items() if k != "payload_bytes"}
        return {"status": "success", "data": res_clean}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/frame")
def api_frame(req: FrameRequest):
    try:
        raw_bytes = bytes.fromhex(req.payload_hex)
        res = apply_framing(raw_bytes, req.method)
        res_clean = {k: v for k, v in res.items() if k != "framed_bytes"}
        return {"status": "success", "data": res_clean}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/crc")
def api_crc(req: CrcRequest):
    try:
        raw_bytes = bytes.fromhex(req.data_hex)
        res = calculate_crc(raw_bytes, req.algorithm)
        return {"status": "success", "data": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-crc")
def api_verify_crc(req: VerifyCrcRequest):
    try:
        raw_bytes = bytes.fromhex(req.data_hex)
        is_valid, details = verify_crc(raw_bytes, req.crc_hex, req.algorithm)
        return {"status": "success", "is_valid": is_valid, "data": details}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt")
def api_decrypt(req: DecryptRequest):
    try:
        raw_bytes = bytes.fromhex(req.payload_hex)
        ok, data, err = decrypt_transaction(raw_bytes)
        if not ok:
            raise HTTPException(status_code=400, detail=err)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/info")
def api_algorithm_info():
    return {
        "encryption": {
            "name": "AES-256-GCM",
            "type": "Authenticated Symmetric Block Cipher with Galois Counter Mode",
            "key_size": "256 bits (32 bytes)",
            "nonce_size": "96 bits (12 bytes, freshly generated per transaction)",
            "auth_tag_size": "128 bits (16 bytes)",
            "advantages": "Provides simultaneous confidentiality, high-speed streaming throughput, and cryptographic message authentication."
        },
        "framing_methods": [
            {
                "id": "CHARACTER_FRAMING",
                "name": "Character Framing (Byte Count)",
                "delimiters": "SOH (0x01) + STX (0x02) at start, Length prefix, ETX (0x03) + EOT (0x04) at end",
                "principle": "Uses reserved non-printable ASCII control characters and explicit length counts to delineate frame boundaries."
            },
            {
                "id": "CHARACTER_STUFFING",
                "name": "Character Stuffing (Byte Stuffing)",
                "delimiters": "DLE STX (0x1002) at start, DLE ETX (0x1003) at end",
                "principle": "Escapes control characters by inserting an extra DLE (0x10) byte whenever DLE appears within the binary payload data."
            },
            {
                "id": "BIT_STUFFING",
                "name": "Bit Stuffing (HDLC / High-Level Data Link Control)",
                "delimiters": "Flag sequence 01111110 (0x7E) at start and end",
                "principle": "Scans payload bitstream; inserts a '0' bit after any five consecutive '1's (11111 -> 111110) to avoid false flag synchronization."
            }
        ],
        "crc_algorithms": list(CRC_DEFINITIONS.values())
    }
