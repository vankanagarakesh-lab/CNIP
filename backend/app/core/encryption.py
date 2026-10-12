"""Real AES-256-GCM Encryption and Decryption module using cryptography library.

Implements authenticated encryption with:
- 256-bit AES Key (32 bytes)
- 96-bit Fresh Nonce (12 bytes)
- 128-bit Authentication Tag (16 bytes)
"""

import os
import json
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from ..config import SECRET_AES_KEY

# Derive/load 32-byte AES key
def get_aes_key() -> bytes:
    try:
        key_bytes = bytes.fromhex(SECRET_AES_KEY)
        if len(key_bytes) == 32:
            return key_bytes
    except Exception:
        pass
    # Fallback safe key derived to 32 bytes
    return SECRET_AES_KEY.encode('utf-8').ljust(32, b'0')[:32]

def encrypt_transaction(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Encrypts transaction dictionary using AES-256-GCM.
    Returns technical details including ciphertext, nonce, and auth tag in hex & bin.
    """
    key = get_aes_key()
    aesgcm = AESGCM(key)
    
    # 96-bit (12-byte) random nonce generated fresh for every transaction
    nonce = os.urandom(12)
    
    # Serialized plaintext
    plaintext_str = json.dumps(transaction_data, sort_keys=True)
    plaintext_bytes = plaintext_str.encode('utf-8')
    
    # AESGCM encrypt outputs ciphertext + 16-byte authentication tag appended
    encrypted_combined = aesgcm.encrypt(nonce, plaintext_bytes, None)
    
    ciphertext = encrypted_combined[:-16]
    auth_tag = encrypted_combined[-16:]
    
    # Package in structured binary payload: NONCE(12) + TAG(16) + CIPHERTEXT(N)
    structured_payload = nonce + auth_tag + ciphertext
    
    return {
        "algorithm": "AES-256-GCM",
        "key_size_bits": 256,
        "nonce_size_bits": 96,
        "tag_size_bits": 128,
        "plaintext_json": plaintext_str,
        "plaintext_size_bytes": len(plaintext_bytes),
        "nonce_hex": nonce.hex().upper(),
        "nonce_bin": "".join(f"{b:08b}" for b in nonce),
        "tag_hex": auth_tag.hex().upper(),
        "tag_bin": "".join(f"{b:08b}" for b in auth_tag),
        "ciphertext_hex": ciphertext.hex().upper(),
        "ciphertext_bin": "".join(f"{b:08b}" for b in ciphertext),
        "payload_bytes": structured_payload,
        "payload_hex": structured_payload.hex().upper(),
        "payload_bin": "".join(f"{b:08b}" for b in structured_payload),
        "payload_size_bytes": len(structured_payload)
    }

def decrypt_transaction(payload_bytes: bytes) -> Tuple[bool, Dict[str, Any], str]:
    """
    Decrypts structured payload: NONCE(12) + TAG(16) + CIPHERTEXT(N)
    Returns: (is_success, decrypted_dict_or_empty, error_message)
    """
    if len(payload_bytes) < 28:
        return False, {}, "Payload too short: Missing required Nonce (12B) and Tag (16B)"
    
    key = get_aes_key()
    aesgcm = AESGCM(key)
    
    nonce = payload_bytes[:12]
    auth_tag = payload_bytes[12:28]
    ciphertext = payload_bytes[28:]
    
    encrypted_combined = ciphertext + auth_tag
    
    try:
        decrypted_bytes = aesgcm.decrypt(nonce, encrypted_combined, None)
        decrypted_str = decrypted_bytes.decode('utf-8')
        transaction_dict = json.loads(decrypted_str)
        return True, transaction_dict, ""
    except Exception as e:
        return False, {}, f"AES-256-GCM Authentication/Decryption Failed: {str(e)}"
