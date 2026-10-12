"""Real CRC Engine implementation:
1. CRC-12 (Polynomial: x^12 + x^11 + x^3 + x^2 + x + 1 => 0x180F)
2. CRC-16 (Polynomial: x^16 + x^15 + x^2 + 1 => 0x18005 / Poly: 0x8005)
3. CRC-CCITT (Polynomial: x^16 + x^12 + x^5 + 1 => 0x11021 / Poly: 0x1021)

Performs genuine bitwise modulo-2 polynomial division and produces educational step-by-step traces.
"""

from typing import Dict, Any, Tuple, List

CRC_DEFINITIONS = {
    "CRC_12": {
        "name": "CRC-12",
        "degree": 12,
        "polynomial_str": "x¹² + x¹¹ + x³ + x² + x + 1",
        "polynomial_bin": "1100000001111", # 13 bits
        "poly_hex": "0x180F",
        "init_val": 0,
        "description": "Standard 12-bit Cyclic Redundancy Check used for 6-bit character streams and industrial telemetry."
    },
    "CRC_16": {
        "name": "CRC-16 (IBM/ANSI)",
        "degree": 16,
        "polynomial_str": "x¹⁶ + x¹⁵ + x² + 1",
        "polynomial_bin": "11000000000000101", # 17 bits
        "poly_hex": "0x18005",
        "init_val": 0,
        "description": "Standard 16-bit Cyclic Redundancy Check widely used in USB, Modbus, and Bisync data link protocols."
    },
    "CRC_CCITT": {
        "name": "CRC-CCITT (ITU-T V.41 / X.25)",
        "degree": 16,
        "polynomial_str": "x¹⁶ + x¹² + x⁵ + 1",
        "polynomial_bin": "10001000000100001", # 17 bits
        "poly_hex": "0x11021",
        "init_val": 0xFFFF,
        "description": "CCITT Standard 16-bit CRC algorithm used in HDLC, X.25, Bluetooth, and telecommunication networks."
    }
}

def bitwise_modulo2_division(dividend_bits: str, divisor_bits: str) -> Tuple[str, List[Dict[str, str]]]:
    """
    Performs true bitwise modulo-2 division (XOR) of dividend by divisor.
    Returns (remainder_bits, list_of_first_n_steps_for_visual_trace).
    """
    n = len(divisor_bits)
    # Convert dividend to list of bits
    div_list = list(dividend_bits)
    trace_steps = []
    
    # We trace up to first 6 operations for educational visualization
    max_trace = 6
    current_trace = 0
    
    for i in range(len(dividend_bits) - n + 1):
        if div_list[i] == '1':
            chunk_before = "".join(div_list[i:i+n])
            # XOR with divisor
            for j in range(n):
                div_list[i + j] = '1' if div_list[i + j] != divisor_bits[j] else '0'
            chunk_after = "".join(div_list[i:i+n])
            
            if current_trace < max_trace:
                trace_steps.append({
                    "step": current_trace + 1,
                    "bit_position": i,
                    "dividend_segment": chunk_before,
                    "divisor_polynomial": divisor_bits,
                    "xor_result": chunk_after
                })
                current_trace += 1
                
    remainder = "".join(div_list[-(n - 1):])
    return remainder, trace_steps

def calculate_crc(data_bytes: bytes, algorithm: str = "CRC_16") -> Dict[str, Any]:
    """
    Calculates CRC checksum over data_bytes using the chosen polynomial.
    """
    algo_key = algorithm.upper()
    if algo_key not in CRC_DEFINITIONS:
        algo_key = "CRC_16"
        
    spec = CRC_DEFINITIONS[algo_key]
    degree = spec["degree"]
    divisor_bits = spec["polynomial_bin"]
    
    # 1. Convert input data to raw bitstream
    data_bitstring = "".join(f"{b:08b}" for b in data_bytes)
    
    # 2. Append degree zeros to the end of data bitstream
    augmented_bitstring = data_bitstring + ('0' * degree)
    
    # 3. Perform Modulo-2 Division
    remainder_bin, trace_steps = bitwise_modulo2_division(augmented_bitstring, divisor_bits)
    
    # 4. Format Remainder into Hex
    remainder_int = int(remainder_bin, 2)
    hex_len = (degree + 3) // 4
    remainder_hex = f"{remainder_int:0{hex_len}X}"
    
    return {
        "algorithm": algo_key,
        "algorithm_name": spec["name"],
        "degree": degree,
        "polynomial": spec["polynomial_str"],
        "poly_bin": divisor_bits,
        "poly_hex": spec["poly_hex"],
        "input_bytes_count": len(data_bytes),
        "input_bits_count": len(data_bitstring),
        "crc_bin": remainder_bin,
        "crc_hex": remainder_hex,
        "crc_int": remainder_int,
        "calculation_trace": trace_steps,
        "summary": f"{spec['name']} calculated {degree}-bit checksum 0x{remainder_hex} ({remainder_bin}) over {len(data_bytes)} bytes."
    }

def verify_crc(received_data_bytes: bytes, received_crc_hex: str, algorithm: str = "CRC_16") -> Tuple[bool, Dict[str, Any]]:
    """
    Verifies CRC integrity by recalculating checksum on received bytes and comparing with received_crc_hex.
    """
    calculated = calculate_crc(received_data_bytes, algorithm)
    
    # Clean received CRC hex
    clean_received_crc = received_crc_hex.strip().upper().replace("0X", "")
    clean_calculated_crc = calculated["crc_hex"].strip().upper().replace("0X", "")
    
    is_valid = (clean_received_crc == clean_calculated_crc)
    
    verification_details = {
        "algorithm": algorithm,
        "algorithm_name": calculated["algorithm_name"],
        "received_crc_hex": clean_received_crc,
        "calculated_crc_hex": clean_calculated_crc,
        "received_crc_bin": f"{int(clean_received_crc, 16):0{calculated['degree']}b}" if clean_received_crc else "",
        "calculated_crc_bin": calculated["crc_bin"],
        "is_valid": is_valid,
        "status": "PASS" if is_valid else "FAIL",
        "message": (
            f"CRC Verification Passed: Recalculated CRC (0x{clean_calculated_crc}) matches Transmitted CRC (0x{clean_received_crc})."
            if is_valid
            else f"CRC Verification Failed: Bit corruption detected! Recalculated CRC (0x{clean_calculated_crc}) does NOT match Transmitted CRC (0x{clean_received_crc})."
        )
    }
    
    return is_valid, verification_details
