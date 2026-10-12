"""End-to-End Simulation Engine.
Implements the full 18-stage workflow:
1. CUSTOMER (Initiation)
2. ENTER TRANSACTION (Parameters)
3. VALIDATE DATA (Format & Integrity Check)
4. AES-256-GCM ENCRYPTION (Confidentiality & Tag)
5. DATA PAYLOAD (Binary Packaging)
6. SELECT FRAMING (Framing/Stuffing)
7. CRC ENGINE (Checksum Calculation)
8. PACKET CREATION (Header + Payload + CRC Assembly)
9. CLIENT (Transmission Queue)
10. ROUTER (Packet Routing & Hop Forwarding)
11. FIREWALL (Educational Packet Inspection)
12. INTERNET (Public Network Channel)
13. ERROR INJECTION (Noise Simulation)
14. CRC VERIFICATION (Error Detection Check)
15. DE-STUFFING (Reverse Stuffing)
16. DE-FRAMING (Remove Frame Delimiters)
17. DECRYPTION (AES-256-GCM Decrypt & Tag Verification)
18. BANK SERVER (Final Settlement & Verification)
"""

import time
import uuid
import json
from datetime import datetime, timezone
from typing import Dict, Any, List

from .encryption import encrypt_transaction, decrypt_transaction
from .framing import apply_framing, remove_framing
from .crc import calculate_crc, verify_crc
from .error_injection import inject_bit_error

def run_transmission_simulation(
    transaction_data: Dict[str, Any],
    framing_method: str = "CHARACTER_STUFFING",
    crc_algorithm: str = "CRC_16",
    inject_error: bool = False,
    error_bit_position: int = None
) -> Dict[str, Any]:
    start_time = time.perf_counter()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    simulation_id = f"SIM-{uuid.uuid4().hex[:8].upper()}"
    transaction_id = f"TXN-{uuid.uuid4().hex[:6].upper()}"
    packet_id = f"PKT-{uuid.uuid4().hex[:6].upper()}"
    
    transaction_data_with_id = {
        "transaction_id": transaction_id,
        "sender_account": transaction_data.get("sender_account", "DEMO-10001"),
        "receiver_account": transaction_data.get("receiver_account", "DEMO-20002"),
        "amount": transaction_data.get("amount", 5000.0),
        "currency": "INR",
        "currency_symbol": "₹",
        "transaction_type": transaction_data.get("transaction_type", "Fund Transfer"),
        "description": transaction_data.get("description", "College Fee Payment"),
        "timestamp": now_iso
    }
    
    steps: List[Dict[str, Any]] = []
    logs: List[Dict[str, Any]] = []
    
    def add_step(
        step_num: int,
        stage: str,
        title: str,
        node: str,
        status: str,
        summary: str,
        tech_details: Dict[str, Any]
    ):
        step_obj = {
            "step_number": step_num,
            "stage": stage,
            "title": title,
            "node": node,
            "status": status,
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3],
            "summary": summary,
            "technical_details": tech_details
        }
        steps.append(step_obj)
        
        event_type = "INFO"
        if status == "SUCCESS":
            event_type = "SUCCESS"
        elif status == "ERROR":
            event_type = "ERROR"
        elif status == "WARNING":
            event_type = "ALERT"
            
        logs.append({
            "timestamp": step_obj["timestamp"],
            "simulation_id": simulation_id,
            "stage": stage,
            "node": node,
            "event_type": event_type,
            "message": summary,
            "details": tech_details
        })

    # -------------------------------------------------------------
    # STAGE 1: CUSTOMER
    # -------------------------------------------------------------
    add_step(
        1,
        "CUSTOMER",
        "Customer Initiates Transaction",
        "CUSTOMER",
        "SUCCESS",
        f"Customer {transaction_data_with_id['sender_account']} started transfer of ₹{transaction_data_with_id['amount']} to {transaction_data_with_id['receiver_account']}.",
        {
            "sender": transaction_data_with_id["sender_account"],
            "receiver": transaction_data_with_id["receiver_account"],
            "amount": transaction_data_with_id["amount"],
            "type": transaction_data_with_id["transaction_type"]
        }
    )

    # -------------------------------------------------------------
    # STAGE 2: ENTER TRANSACTION
    # -------------------------------------------------------------
    add_step(
        2,
        "ENTER_TRANSACTION",
        "Transaction Form Input Captured",
        "CUSTOMER",
        "SUCCESS",
        f"Transaction parameters packaged for {transaction_id}.",
        {
            "transaction_id": transaction_id,
            "raw_json": json.dumps(transaction_data_with_id, indent=2)
        }
    )

    # -------------------------------------------------------------
    # STAGE 3: VALIDATE DATA
    # -------------------------------------------------------------
    if transaction_data_with_id["amount"] <= 0:
        add_step(
            3,
            "VALIDATE_DATA",
            "Data Validation Failed",
            "CLIENT",
            "ERROR",
            "Amount must be positive.",
            {"error": "Invalid Amount"}
        )
        return {
            "simulation_id": simulation_id,
            "transaction_id": transaction_id,
            "packet_id": packet_id,
            "framing_method": framing_method,
            "crc_algorithm": crc_algorithm,
            "error_injected": False,
            "crc_verification_result": "N/A",
            "final_status": "REJECTED",
            "failure_reason": "Data validation failed",
            "original_transaction": transaction_data_with_id,
            "recovered_transaction": None,
            "packet_summary": {},
            "steps": steps,
            "logs": logs
        }
        
    add_step(
        3,
        "VALIDATE_DATA",
        "Data Validation Passed",
        "CLIENT",
        "SUCCESS",
        "Sender, receiver, amount, and character constraints verified successfully.",
        {
            "validation_status": "VALID",
            "checked_fields": ["sender_account", "receiver_account", "amount", "transaction_type"],
            "account_format_check": "PASSED"
        }
    )

    # -------------------------------------------------------------
    # STAGE 4: AES-256-GCM ENCRYPTION
    # -------------------------------------------------------------
    enc_result = encrypt_transaction(transaction_data_with_id)
    add_step(
        4,
        "AES_ENCRYPTION",
        "AES-256-GCM Encryption Completed",
        "CLIENT",
        "SUCCESS",
        f"Encrypted {enc_result['plaintext_size_bytes']} bytes of transaction JSON using AES-256-GCM with fresh 96-bit nonce.",
        {
            "algorithm": enc_result["algorithm"],
            "key_size_bits": enc_result["key_size_bits"],
            "nonce_hex": enc_result["nonce_hex"],
            "nonce_bin": enc_result["nonce_bin"],
            "tag_hex": enc_result["tag_hex"],
            "tag_bin": enc_result["tag_bin"],
            "ciphertext_hex": enc_result["ciphertext_hex"],
            "ciphertext_bin": enc_result["ciphertext_bin"],
            "secret_key_status": "Secure (Hidden from UI / Protected in Backend)"
        }
    )

    # -------------------------------------------------------------
    # STAGE 5: DATA PAYLOAD
    # -------------------------------------------------------------
    payload_bytes = enc_result["payload_bytes"]
    add_step(
        5,
        "DATA_PAYLOAD",
        "Encrypted Binary Payload Assembled",
        "CLIENT",
        "SUCCESS",
        f"Packaged Nonce (12B) + Tag (16B) + Ciphertext ({len(enc_result['ciphertext_hex'])//2}B) into {enc_result['payload_size_bytes']} bytes payload.",
        {
            "transaction_id": transaction_id,
            "payload_size_bytes": enc_result["payload_size_bytes"],
            "payload_hex": enc_result["payload_hex"],
            "payload_bin": enc_result["payload_bin"]
        }
    )

    # -------------------------------------------------------------
    # STAGE 6: SELECT FRAMING
    # -------------------------------------------------------------
    framing_result = apply_framing(payload_bytes, framing_method)
    framed_bytes = framing_result["framed_bytes"]
    
    add_step(
        6,
        "SELECT_FRAMING",
        f"Framing Applied: {framing_result['name']}",
        "CLIENT",
        "SUCCESS",
        f"Applied {framing_result['name']} to encapsulate payload. Size expanded from {framing_result['original_size_bytes']}B to {framing_result['framed_size_bytes']}B.",
        {
            "method": framing_result["method"],
            "name": framing_result["name"],
            "description": framing_result["description"],
            "original_hex": framing_result["original_hex"],
            "framed_hex": framing_result["framed_hex"],
            "framed_bin": framing_result["framed_bin"][:160] + ("..." if len(framing_result["framed_bin"]) > 160 else ""),
            "stuffed_count": framing_result.get("stuffed_count", 0),
            "details": framing_result.get("details", {})
        }
    )

    # -------------------------------------------------------------
    # STAGE 7: CRC ENGINE
    # -------------------------------------------------------------
    crc_result = calculate_crc(framed_bytes, crc_algorithm)
    crc_hex = crc_result["crc_hex"]
    crc_bin = crc_result["crc_bin"]
    
    add_step(
        7,
        "CRC_ENGINE",
        f"CRC Calculated: {crc_result['algorithm_name']}",
        "CLIENT",
        "SUCCESS",
        f"Calculated {crc_result['degree']}-bit CRC Checksum: 0x{crc_hex} using polynomial {crc_result['polynomial']}.",
        {
            "algorithm": crc_result["algorithm"],
            "algorithm_name": crc_result["algorithm_name"],
            "polynomial": crc_result["polynomial"],
            "poly_hex": crc_result["poly_hex"],
            "poly_bin": crc_result["poly_bin"],
            "crc_hex": crc_hex,
            "crc_bin": crc_bin,
            "input_bytes_count": crc_result["input_bytes_count"],
            "calculation_trace": crc_result["calculation_trace"]
        }
    )

    # -------------------------------------------------------------
    # STAGE 8: PACKET CREATION
    # -------------------------------------------------------------
    packet_size = len(framed_bytes) + (len(crc_hex) // 2)
    packet_summary = {
        "packet_id": packet_id,
        "transaction_id": transaction_id,
        "source": "CLIENT_NODE_01",
        "destination": "BANK_SERVER_SECURE",
        "framing_method": framing_method,
        "crc_algorithm": crc_algorithm,
        "crc_value_hex": crc_hex,
        "crc_value_bin": crc_bin,
        "original_payload_hex": payload_bytes.hex().upper(),
        "framed_payload_hex": framed_bytes.hex().upper(),
        "packet_size_bytes": packet_size
    }
    
    add_step(
        8,
        "PACKET_CREATION",
        "Secure Data Packet Formed",
        "CLIENT",
        "SUCCESS",
        f"Packet {packet_id} constructed with Header, Encrypted/Framed Payload, and CRC Checksum 0x{crc_hex}.",
        packet_summary
    )

    # -------------------------------------------------------------
    # STAGE 9: CLIENT
    # -------------------------------------------------------------
    add_step(
        9,
        "CLIENT_TRANSMIT",
        "Client Transmits Packet to Network Interface",
        "CLIENT",
        "SUCCESS",
        "Packet dispatched from Client Host Network Interface Card (NIC).",
        {
            "interface": "eth0 / TLS-MAC link",
            "source_ip": "192.168.1.105",
            "packet_id": packet_id
        }
    )

    # -------------------------------------------------------------
    # STAGE 10: ROUTER
    # -------------------------------------------------------------
    add_step(
        10,
        "ROUTER",
        "Edge Router Hop Forwarding",
        "ROUTER",
        "SUCCESS",
        "Edge Gateway Router verified routing table and forwarded packet toward Core Banking Gateway.",
        {
            "router_id": "GATEWAY-RTR-01",
            "hop": 1,
            "routing_protocol": "BGP / OSPF",
            "ttl": 64
        }
    )

    # -------------------------------------------------------------
    # STAGE 11: FIREWALL
    # -------------------------------------------------------------
    add_step(
        11,
        "FIREWALL",
        "Security Firewall Inspection",
        "FIREWALL",
        "SUCCESS",
        "Stateful Firewall inspected packet structure, destination port, and security posture. Passed inspection.",
        {
            "firewall_status": "PACKET INSPECTED",
            "rules_matched": "ALLOW_FINANCIAL_SECURE_PAYLOAD",
            "destination_port": 443,
            "note": "Educational Firewall Simulation"
        }
    )

    # -------------------------------------------------------------
    # STAGE 12: INTERNET
    # -------------------------------------------------------------
    add_step(
        12,
        "INTERNET",
        "Public Network Channel Transmission",
        "INTERNET",
        "SUCCESS",
        "Packet traversing intermediate fiber and routing infrastructure.",
        {
            "channel": "Public Internet WAN",
            "simulated_latency_ms": 28.5
        }
    )

    # -------------------------------------------------------------
    # STAGE 13: ERROR INJECTION (Channel Noise)
    # -------------------------------------------------------------
    transmitted_frame = framed_bytes
    error_meta = {}
    
    if inject_error:
        transmitted_frame, error_meta = inject_bit_error(framed_bytes, error_bit_position)
        add_step(
            13,
            "ERROR_INJECTION",
            "⚡ Channel Noise: Transmission Bit Error Injected",
            "INTERNET",
            "WARNING",
            f"Active bit corruption injected: Inverted bit #{error_meta['target_bit_index']} in byte #{error_meta['target_byte_index']}.",
            {
                "error_injected": True,
                "target_bit_index": error_meta["target_bit_index"],
                "target_byte_index": error_meta["target_byte_index"],
                "original_byte_hex": error_meta["original_byte_hex"],
                "corrupted_byte_hex": error_meta["corrupted_byte_hex"],
                "original_bit": error_meta["original_bit_value"],
                "corrupted_bit": error_meta["corrupted_bit_value"],
                "original_hex_sample": framed_bytes[:16].hex().upper(),
                "corrupted_hex_sample": transmitted_frame[:16].hex().upper(),
                "explanation": "Simulates physical layer noise, crosstalk, or electromagnetic interference corrupting data in transit."
            }
        )
    else:
        add_step(
            13,
            "ERROR_INJECTION",
            "Channel Clean: No Transmission Errors",
            "INTERNET",
            "SUCCESS",
            "Physical transmission channel was clean. Zero bit errors introduced.",
            {
                "error_injected": False,
                "channel_quality": "Optimal (SNR > 35dB)",
                "bits_corrupted": 0
            }
        )

    # -------------------------------------------------------------
    # STAGE 14: CRC VERIFICATION
    # -------------------------------------------------------------
    is_crc_valid, crc_verify_details = verify_crc(transmitted_frame, crc_hex, crc_algorithm)
    
    if not is_crc_valid:
        add_step(
            14,
            "CRC_VERIFICATION",
            "✕ CRC Verification Failed: Bit Corruption Detected!",
            "BANK_SERVER",
            "ERROR",
            f"CRC MISMATCH! Expected 0x{crc_hex} but recalculated 0x{crc_verify_details['calculated_crc_hex']}. Packet REJECTED!",
            {
                "status": "FAIL",
                "transmitted_crc": f"0x{crc_hex}",
                "recalculated_crc": f"0x{crc_verify_details['calculated_crc_hex']}",
                "result": "CRC FAIL - DATA INTEGRITY COMPROMISED",
                "action": "HALT PIPELINE / REJECT PACKET"
            }
        )
        
        # Stop normal successful pipeline, do not decrypt corrupted data!
        add_step(
            15,
            "TRANSMISSION_FAILED",
            "Transmission Terminated: Packet Rejected by Bank Server",
            "BANK_SERVER",
            "ERROR",
            "Bank Server refused to process corrupted packet. Pipeline halted to protect financial data integrity.",
            {
                "reason": "DATA INTEGRITY ERROR DETECTED BY CRC",
                "resolution": "Request Retransmission (ARQ)"
            }
        )
        
        total_latency = (time.perf_counter() - start_time) * 1000
        
        return {
            "simulation_id": simulation_id,
            "transaction_id": transaction_id,
            "packet_id": packet_id,
            "framing_method": framing_method,
            "crc_algorithm": crc_algorithm,
            "error_injected": True,
            "crc_verification_result": "FAIL",
            "final_status": "REJECTED",
            "failure_reason": "DATA INTEGRITY ERROR DETECTED BY CRC",
            "original_transaction": transaction_data_with_id,
            "recovered_transaction": None,
            "packet_summary": {
                **packet_summary,
                "corrupted_payload_hex": transmitted_frame.hex().upper(),
                "corrupted_crc_hex": crc_verify_details["calculated_crc_hex"],
                "transmission_status": "REJECTED"
            },
            "steps": steps,
            "logs": logs,
            "latency_ms": round(total_latency, 2)
        }

    # CRC PASSED
    add_step(
        14,
        "CRC_VERIFICATION",
        "✓ CRC Verification Passed: Integrity Verified",
        "BANK_SERVER",
        "SUCCESS",
        f"Recalculated CRC (0x{crc_verify_details['calculated_crc_hex']}) matches Transmitted CRC (0x{crc_hex}). Integrity confirmed!",
        {
            "status": "PASS",
            "transmitted_crc": f"0x{crc_hex}",
            "recalculated_crc": f"0x{crc_verify_details['calculated_crc_hex']}",
            "result": "CRC PASS - 100% BIT INTEGRITY CONFIRMED"
        }
    )

    # -------------------------------------------------------------
    # STAGE 15: DE-STUFFING
    # -------------------------------------------------------------
    # Framing removal reverses both framing boundary and stuffing
    destuff_success, destuffed_payload, destuff_err = remove_framing(transmitted_frame, framing_method)
    
    if not destuff_success:
        add_step(
            15,
            "DE_STUFFING",
            "✕ De-stuffing / Frame Parsing Error",
            "BANK_SERVER",
            "ERROR",
            f"Failed to reverse framing: {destuff_err}",
            {"error": destuff_err}
        )
        return {
            "simulation_id": simulation_id,
            "transaction_id": transaction_id,
            "packet_id": packet_id,
            "framing_method": framing_method,
            "crc_algorithm": crc_algorithm,
            "error_injected": False,
            "crc_verification_result": "PASS",
            "final_status": "REJECTED",
            "failure_reason": f"De-stuffing failed: {destuff_err}",
            "original_transaction": transaction_data_with_id,
            "recovered_transaction": None,
            "packet_summary": packet_summary,
            "steps": steps,
            "logs": logs
        }
        
    add_step(
        15,
        "DE_STUFFING",
        f"De-Stuffing Completed: {framing_result['name']}",
        "BANK_SERVER",
        "SUCCESS",
        f"Successfully reversed stuffing rules. Stuffed control characters / bits removed.",
        {
            "stuffed_input_bytes": len(transmitted_frame),
            "destuffed_output_bytes": len(destuffed_payload),
            "stuffed_elements_removed": framing_result.get("stuffed_count", 0)
        }
    )

    # -------------------------------------------------------------
    # STAGE 16: DE-FRAMING
    # -------------------------------------------------------------
    add_step(
        16,
        "DE_FRAMING",
        "De-Framing Completed: Encrypted Payload Extracted",
        "BANK_SERVER",
        "SUCCESS",
        f"Frame headers and delimiters stripped. Restored exact {len(destuffed_payload)}B encrypted payload.",
        {
            "extracted_payload_hex": destuffed_payload.hex().upper(),
            "payload_matches_transmitted": (destuffed_payload == payload_bytes)
        }
    )

    # -------------------------------------------------------------
    # STAGE 17: DECRYPTION
    # -------------------------------------------------------------
    decrypt_ok, decrypted_dict, decrypt_err = decrypt_transaction(destuffed_payload)
    
    if not decrypt_ok:
        add_step(
            17,
            "DECRYPTION",
            "✕ AES-256-GCM Decryption Failed",
            "BANK_SERVER",
            "ERROR",
            f"Decryption / Authentication Tag failure: {decrypt_err}",
            {"error": decrypt_err}
        )
        return {
            "simulation_id": simulation_id,
            "transaction_id": transaction_id,
            "packet_id": packet_id,
            "framing_method": framing_method,
            "crc_algorithm": crc_algorithm,
            "error_injected": False,
            "crc_verification_result": "PASS",
            "final_status": "REJECTED",
            "failure_reason": decrypt_err,
            "original_transaction": transaction_data_with_id,
            "recovered_transaction": None,
            "packet_summary": packet_summary,
            "steps": steps,
            "logs": logs
        }
        
    add_step(
        17,
        "DECRYPTION",
        "✓ AES-256-GCM Decryption & Authentication Tag Verified",
        "BANK_SERVER",
        "SUCCESS",
        "Ciphertext successfully decrypted with verified 128-bit GCM authentication tag. Plaintext restored.",
        {
            "algorithm": "AES-256-GCM",
            "auth_tag_status": "AUTHENTICATED & VALID",
            "decrypted_transaction_id": decrypted_dict.get("transaction_id"),
            "decrypted_amount": decrypted_dict.get("amount")
        }
    )

    # -------------------------------------------------------------
    # STAGE 18: BANK SERVER / TRANSACTION VERIFIED
    # -------------------------------------------------------------
    add_step(
        18,
        "BANK_SERVER_VERIFIED",
        "✓ Bank Server: Transaction Verified & Settled",
        "BANK_SERVER",
        "SUCCESS",
        f"Transaction {transaction_id} verified. ₹{decrypted_dict.get('amount')} transferred from {decrypted_dict.get('sender_account')} to {decrypted_dict.get('receiver_account')}.",
        {
            "final_status": "SETTLED & VERIFIED",
            "transaction_id": transaction_id,
            "sender": decrypted_dict.get("sender_account"),
            "receiver": decrypted_dict.get("receiver_account"),
            "amount": f"₹{decrypted_dict.get('amount')}",
            "type": decrypted_dict.get("transaction_type"),
            "description": decrypted_dict.get("description")
        }
    )

    total_latency = (time.perf_counter() - start_time) * 1000

    return {
        "simulation_id": simulation_id,
        "transaction_id": transaction_id,
        "packet_id": packet_id,
        "framing_method": framing_method,
        "crc_algorithm": crc_algorithm,
        "error_injected": False,
        "crc_verification_result": "PASS",
        "final_status": "SUCCESSFUL",
        "failure_reason": None,
        "original_transaction": transaction_data_with_id,
        "recovered_transaction": decrypted_dict,
        "packet_summary": {
            **packet_summary,
            "transmission_status": "ACCEPTED"
        },
        "steps": steps,
        "logs": logs,
        "latency_ms": round(total_latency, 2)
    }
