"""Real Error Injection Engine:
Simulates physical transmission channel noise and bit errors.
Inverts specific bits in the transmitted framed packet.
"""

from typing import Dict, Any, Tuple, Optional

def inject_bit_error(
    framed_bytes: bytes,
    bit_position: Optional[int] = None
) -> Tuple[bytes, Dict[str, Any]]:
    """
    Flips a specific bit in the framed byte stream.
    If bit_position is None, flips a bit in the middle of the payload data.
    """
    byte_array = bytearray(framed_bytes)
    total_bits = len(byte_array) * 8
    
    if total_bits == 0:
        return framed_bytes, {"error_injected": False, "message": "Payload empty"}
        
    # Choose a target bit position if none provided (e.g. at 40% into the packet)
    if bit_position is None or bit_position < 0 or bit_position >= total_bits:
        target_bit_idx = max(8, min(total_bits - 8, total_bits // 2 + 3))
    else:
        target_bit_idx = bit_position
        
    target_byte_idx = target_bit_idx // 8
    target_bit_offset = 7 - (target_bit_idx % 8) # Most significant bit is index 0
    
    original_byte = byte_array[target_byte_idx]
    original_bit_val = (original_byte >> target_bit_offset) & 1
    
    # Flip the bit
    corrupted_byte = original_byte ^ (1 << target_bit_offset)
    corrupted_bit_val = (corrupted_byte >> target_bit_offset) & 1
    byte_array[target_byte_idx] = corrupted_byte
    
    corrupted_bytes = bytes(byte_array)
    
    error_metadata = {
        "error_injected": True,
        "target_bit_index": target_bit_idx,
        "target_byte_index": target_byte_idx,
        "target_bit_offset_in_byte": target_bit_offset,
        "original_byte_hex": f"0x{original_byte:02X}",
        "corrupted_byte_hex": f"0x{corrupted_byte:02X}",
        "original_bit_value": original_bit_val,
        "corrupted_bit_value": corrupted_bit_val,
        "original_payload_hex": framed_bytes.hex().upper(),
        "corrupted_payload_hex": corrupted_bytes.hex().upper(),
        "description": f"Channel Noise Injected: Inverted bit #{target_bit_idx} in byte #{target_byte_idx} from {original_bit_val} to {corrupted_bit_val} (0x{original_byte:02X} -> 0x{corrupted_byte:02X})."
    }
    
    return corrupted_bytes, error_metadata
