"""Real Framing & Stuffing Algorithms:
1. Character Framing (Byte Delimiters SOH/STX + Length + ETX/EOT)
2. Character Stuffing (DLE STX / DLE ETX with DLE byte escaping)
3. Bit Stuffing (HDLC 01111110 flags with 0-bit insertion after five 1s)
"""

from typing import Dict, Any, Tuple, List

# Control Characters
SOH = b'\x01'  # Start of Header
STX = b'\x02'  # Start of Text
ETX = b'\x03'  # End of Text
EOT = b'\x04'  # End of Transmission
DLE = b'\x10'  # Data Link Escape
FLAG_BYTE = b'\x7E' # 0x7E = 01111110
FLAG_BIN = "01111110"

# ----------------------------------------------------------------------
# 1. CHARACTER FRAMING
# ----------------------------------------------------------------------
def apply_character_framing(data_bytes: bytes) -> Dict[str, Any]:
    """
    Encloses data in SOH + STX header + 2-byte Length prefix + Payload + ETX + EOT trailer.
    """
    length_bytes = len(data_bytes).to_bytes(2, byteorder='big')
    framed_bytes = SOH + STX + length_bytes + data_bytes + ETX + EOT
    
    return {
        "method": "CHARACTER_FRAMING",
        "name": "Character Framing",
        "description": "Frames data with SOH (0x01) + STX (0x02), 2-byte Big-Endian Length prefix, and ETX (0x03) + EOT (0x04) trailer.",
        "header_hex": (SOH + STX + length_bytes).hex().upper(),
        "trailer_hex": (ETX + EOT).hex().upper(),
        "original_size_bytes": len(data_bytes),
        "framed_size_bytes": len(framed_bytes),
        "original_hex": data_bytes.hex().upper(),
        "original_bin": "".join(f"{b:08b}" for b in data_bytes),
        "framed_bytes": framed_bytes,
        "framed_hex": framed_bytes.hex().upper(),
        "framed_bin": "".join(f"{b:08b}" for b in framed_bytes),
        "stuffed_count": 0,
        "details": {
            "start_delimiter": "SOH (0x01) + STX (0x02)",
            "length_prefix": f"{len(data_bytes)} bytes (0x{length_bytes.hex().upper()})",
            "end_delimiter": "ETX (0x03) + EOT (0x04)"
        }
    }

def remove_character_framing(framed_bytes: bytes) -> Tuple[bool, bytes, str]:
    """
    Removes character framing delimiters and checks length integrity.
    """
    if len(framed_bytes) < 6: # SOH(1) + STX(1) + LEN(2) + ETX(1) + EOT(1)
        return False, b"", "Frame is too short to contain character framing headers"
    
    if framed_bytes[:2] != SOH + STX:
        return False, b"", f"Invalid frame start delimiter: expected 0102, found {framed_bytes[:2].hex()}"
    
    if framed_bytes[-2:] != ETX + EOT:
        return False, b"", f"Invalid frame end delimiter: expected 0304, found {framed_bytes[-2:].hex()}"
    
    expected_len = int.from_bytes(framed_bytes[2:4], byteorder='big')
    payload = framed_bytes[4:-2]
    
    if len(payload) != expected_len:
        return False, b"", f"Length mismatch: Header states {expected_len} bytes, but extracted {len(payload)} bytes"
    
    return True, payload, ""

# ----------------------------------------------------------------------
# 2. CHARACTER STUFFING (Byte Stuffing)
# ----------------------------------------------------------------------
def apply_character_stuffing(data_bytes: bytes) -> Dict[str, Any]:
    """
    Applies DLE STX start, DLE ETX end, and escapes any DLE (0x10) in the payload with an extra DLE.
    """
    stuffed_payload = bytearray()
    stuffed_positions: List[int] = []
    
    for idx, byte_val in enumerate(data_bytes):
        if byte_val == 0x10: # DLE
            stuffed_payload.append(0x10) # Insert Escape DLE
            stuffed_positions.append(len(stuffed_payload) - 1)
        stuffed_payload.append(byte_val)
        
    framed_bytes = bytes(DLE + STX + stuffed_payload + DLE + ETX)
    
    return {
        "method": "CHARACTER_STUFFING",
        "name": "Character Stuffing (Byte Stuffing)",
        "description": "Delimits frame with DLE STX (0x1002) and DLE ETX (0x1003). Stuffs an extra DLE (0x10) before any DLE byte occurring in the payload.",
        "header_hex": (DLE + STX).hex().upper(),
        "trailer_hex": (DLE + ETX).hex().upper(),
        "original_size_bytes": len(data_bytes),
        "framed_size_bytes": len(framed_bytes),
        "original_hex": data_bytes.hex().upper(),
        "original_bin": "".join(f"{b:08b}" for b in data_bytes),
        "framed_bytes": framed_bytes,
        "framed_hex": framed_bytes.hex().upper(),
        "framed_bin": "".join(f"{b:08b}" for b in framed_bytes),
        "stuffed_count": len(stuffed_positions),
        "stuffed_positions": stuffed_positions,
        "details": {
            "start_delimiter": "DLE STX (0x1002)",
            "end_delimiter": "DLE ETX (0x1003)",
            "escape_byte": "DLE (0x10)",
            "stuffed_dle_count": len(stuffed_positions)
        }
    }

def remove_character_stuffing(framed_bytes: bytes) -> Tuple[bool, bytes, str]:
    """
    Reverses character stuffing: validates DLE STX & DLE ETX, unescapes DLE DLE -> DLE.
    """
    if len(framed_bytes) < 4:
        return False, b"", "Frame is too short for DLE STX / DLE ETX delimiters"
    
    if framed_bytes[:2] != DLE + STX:
        return False, b"", f"Invalid start delimiter: expected 1002 (DLE STX), found {framed_bytes[:2].hex()}"
    
    if framed_bytes[-2:] != DLE + ETX:
        return False, b"", f"Invalid end delimiter: expected 1003 (DLE ETX), found {framed_bytes[-2:].hex()}"
    
    payload_stuffed = framed_bytes[2:-2]
    destuffed = bytearray()
    i = 0
    while i < len(payload_stuffed):
        if payload_stuffed[i] == 0x10:
            if i + 1 < len(payload_stuffed) and payload_stuffed[i+1] == 0x10:
                destuffed.append(0x10)
                i += 2 # Skip stuffed DLE
            else:
                destuffed.append(payload_stuffed[i])
                i += 1
        else:
            destuffed.append(payload_stuffed[i])
            i += 1
            
    return True, bytes(destuffed), ""

# ----------------------------------------------------------------------
# 3. BIT STUFFING (HDLC Protocol)
# ----------------------------------------------------------------------
def apply_bit_stuffing(data_bytes: bytes) -> Dict[str, Any]:
    """
    Applies HDLC Flag 01111110 (0x7E) at boundaries and inserts a '0' bit after five consecutive '1's.
    """
    raw_bitstring = "".join(f"{b:08b}" for b in data_bytes)
    
    stuffed_bitstring_list = []
    consecutive_ones = 0
    stuffed_bit_indices = []
    
    for bit in raw_bitstring:
        stuffed_bitstring_list.append(bit)
        if bit == '1':
            consecutive_ones += 1
            if consecutive_ones == 5:
                # Insert stuffed 0
                stuffed_bitstring_list.append('0')
                stuffed_bit_indices.append(len(stuffed_bitstring_list) - 1)
                consecutive_ones = 0
        else:
            consecutive_ones = 0
            
    body_bits = "".join(stuffed_bitstring_list)
    
    # Prepend and append 01111110 (Flag)
    # Also pad body with 0s to make total length multiple of 8 if needed, but store exact bit count
    full_bitstring = FLAG_BIN + body_bits + FLAG_BIN
    
    pad_len = (8 - (len(full_bitstring) % 8)) % 8
    padded_full_bits = full_bitstring + ('0' * pad_len)
    
    framed_bytes = bytearray()
    for i in range(0, len(padded_full_bits), 8):
        byte_chunk = padded_full_bits[i:i+8]
        framed_bytes.append(int(byte_chunk, 2))
        
    framed_bytes = bytes(framed_bytes)
    
    return {
        "method": "BIT_STUFFING",
        "name": "Bit Stuffing (HDLC Protocol)",
        "description": "Frames data with 01111110 (0x7E) flags. Whenever five consecutive 1s occur in payload bitstream, a 0 is inserted (11111 -> 111110).",
        "flag_pattern": FLAG_BIN,
        "original_size_bytes": len(data_bytes),
        "framed_size_bytes": len(framed_bytes),
        "original_hex": data_bytes.hex().upper(),
        "original_bin": raw_bitstring,
        "stuffed_body_bin": body_bits,
        "framed_bytes": framed_bytes,
        "framed_hex": framed_bytes.hex().upper(),
        "framed_bin": full_bitstring,
        "stuffed_count": len(stuffed_bit_indices),
        "stuffed_bit_indices": stuffed_bit_indices,
        "pad_bits_count": pad_len,
        "total_bits_count": len(full_bitstring),
        "details": {
            "start_flag": "01111110 (0x7E)",
            "end_flag": "01111110 (0x7E)",
            "rule": "Insert 0 after five consecutive 1s (11111 -> 111110)",
            "stuffed_zero_count": len(stuffed_bit_indices)
        }
    }

def remove_bit_stuffing(framed_bytes: bytes) -> Tuple[bool, bytes, str]:
    """
    Reverses bit stuffing by stripping flag patterns (01111110) and un-stuffing '0's after five consecutive '1's.
    """
    bitstring = "".join(f"{b:08b}" for b in framed_bytes)
    
    # Locate flag 01111110 at start
    start_flag_idx = bitstring.find(FLAG_BIN)
    if start_flag_idx == -1:
        return False, b"", "No start flag 01111110 found in framed bitstream"
    
    # Locate flag 01111110 at end (after start flag)
    end_flag_idx = bitstring.rfind(FLAG_BIN)
    if end_flag_idx <= start_flag_idx:
        return False, b"", "No distinct end flag 01111110 found in framed bitstream"
        
    payload_bits = bitstring[start_flag_idx + 8 : end_flag_idx]
    
    destuffed_bits = []
    consecutive_ones = 0
    i = 0
    while i < len(payload_bits):
        bit = payload_bits[i]
        destuffed_bits.append(bit)
        if bit == '1':
            consecutive_ones += 1
            if consecutive_ones == 5:
                # Expect stuffed '0' next
                if i + 1 < len(payload_bits):
                    if payload_bits[i+1] == '0':
                        i += 1 # Skip stuffed 0 bit
                    else:
                        # Could be an error or unexpected pattern
                        pass
                consecutive_ones = 0
        else:
            consecutive_ones = 0
        i += 1
        
    destuffed_bitstr = "".join(destuffed_bits)
    
    # Convert bits back to bytes (trimming trailing bits if not multiple of 8)
    byte_count = len(destuffed_bitstr) // 8
    recovered_bytes = bytearray()
    for b_idx in range(byte_count):
        chunk = destuffed_bitstr[b_idx*8 : (b_idx+1)*8]
        recovered_bytes.append(int(chunk, 2))
        
    return True, bytes(recovered_bytes), ""

# Helper to dispatch
def apply_framing(data_bytes: bytes, method: str) -> Dict[str, Any]:
    method_upper = method.upper()
    if method_upper in ["CHARACTER_FRAMING", "CHAR_FRAMING"]:
        return apply_character_framing(data_bytes)
    elif method_upper in ["CHARACTER_STUFFING", "CHAR_STUFFING", "BYTE_STUFFING"]:
        return apply_character_stuffing(data_bytes)
    elif method_upper in ["BIT_STUFFING", "BIT"]:
        return apply_bit_stuffing(data_bytes)
    else:
        # Default fallback
        return apply_character_stuffing(data_bytes)

def remove_framing(framed_bytes: bytes, method: str) -> Tuple[bool, bytes, str]:
    method_upper = method.upper()
    if method_upper in ["CHARACTER_FRAMING", "CHAR_FRAMING"]:
        return remove_character_framing(framed_bytes)
    elif method_upper in ["CHARACTER_STUFFING", "CHAR_STUFFING", "BYTE_STUFFING"]:
        return remove_character_stuffing(framed_bytes)
    elif method_upper in ["BIT_STUFFING", "BIT"]:
        return remove_bit_stuffing(framed_bytes)
    else:
        return remove_character_stuffing(framed_bytes)
