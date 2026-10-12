"""Simulation API Router with database persistence and real-time logs."""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import SimulationRecord, Transaction, Packet, SecurityLog
from ..schemas import SimulationRequest, SimulationResponse
from ..core.simulator import run_transmission_simulation

router = APIRouter(prefix="/api/simulations", tags=["Simulations"])

@router.post("/run", response_model=SimulationResponse)
def api_run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    tx_dict = req.transaction.model_dump()
    
    # Run simulation
    result = run_transmission_simulation(
        transaction_data=tx_dict,
        framing_method=req.framing_method,
        crc_algorithm=req.crc_algorithm,
        inject_error=req.inject_error,
        error_bit_position=req.error_bit_position
    )
    
    # Persist Transaction
    orig_tx = result["original_transaction"]
    db_tx = Transaction(
        id=result["transaction_id"],
        sender_account=orig_tx.get("sender_account", "N/A"),
        receiver_account=orig_tx.get("receiver_account", "N/A"),
        amount=float(orig_tx.get("amount", 0.0)),
        transaction_type=orig_tx.get("transaction_type", "Fund Transfer"),
        description=orig_tx.get("description", ""),
        status="VERIFIED" if result["final_status"] == "SUCCESSFUL" else "REJECTED"
    )
    db.add(db_tx)
    
    # Persist Packet
    pkt_data = result["packet_summary"]
    if pkt_data:
        db_pkt = Packet(
            id=result["packet_id"],
            transaction_id=result["transaction_id"],
            source=pkt_data.get("source", "CLIENT_NODE_01"),
            destination=pkt_data.get("destination", "BANK_SERVER_SECURE"),
            framing_method=req.framing_method,
            crc_algorithm=req.crc_algorithm,
            crc_value_hex=pkt_data.get("crc_value_hex", "0000"),
            crc_value_bin=pkt_data.get("crc_value_bin", "00000000"),
            original_payload_hex=pkt_data.get("original_payload_hex", ""),
            framed_payload_hex=pkt_data.get("framed_payload_hex", ""),
            error_injected=req.inject_error,
            corrupted_payload_hex=pkt_data.get("corrupted_payload_hex"),
            corrupted_crc_hex=pkt_data.get("corrupted_crc_hex"),
            packet_size_bytes=pkt_data.get("packet_size_bytes", 0),
            transmission_status=pkt_data.get("transmission_status", result["final_status"])
        )
        db.add(db_pkt)
    
    # Persist Simulation Record
    db_sim = SimulationRecord(
        id=result["simulation_id"],
        transaction_id=result["transaction_id"],
        packet_id=result["packet_id"],
        framing_method=req.framing_method,
        crc_algorithm=req.crc_algorithm,
        error_injected=req.inject_error,
        crc_verification_result=result["crc_verification_result"],
        final_status=result["final_status"],
        latency_ms=result.get("latency_ms", 0.0),
        failure_reason=result.get("failure_reason"),
        steps_json=json.dumps(result["steps"])
    )
    db.add(db_sim)
    
    # Persist Security Logs
    for log_item in result.get("logs", []):
        db_log = SecurityLog(
            simulation_id=result["simulation_id"],
            stage=log_item.get("stage", "UNKNOWN"),
            node=log_item.get("node", "CLIENT"),
            event_type=log_item.get("event_type", "INFO"),
            message=log_item.get("message", ""),
            details_json=json.dumps(log_item.get("details", {}))
        )
        db.add(db_log)
        
    db.commit()
    return result

@router.get("/")
def api_get_simulations(limit: int = 50, db: Session = Depends(get_db)):
    records = db.query(SimulationRecord).order_by(desc(SimulationRecord.created_at)).limit(limit).all()
    out = []
    for r in records:
        try:
            steps_parsed = json.loads(r.steps_json)
        except Exception:
            steps_parsed = []
            
        out.append({
            "simulation_id": r.id,
            "transaction_id": r.transaction_id,
            "packet_id": r.packet_id,
            "framing_method": r.framing_method,
            "crc_algorithm": r.crc_algorithm,
            "error_injected": r.error_injected,
            "crc_verification_result": r.crc_verification_result,
            "final_status": r.final_status,
            "latency_ms": r.latency_ms,
            "failure_reason": r.failure_reason,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "steps_count": len(steps_parsed)
        })
    return out

@router.get("/{sim_id}")
def api_get_simulation_detail(sim_id: str, db: Session = Depends(get_db)):
    sim = db.query(SimulationRecord).filter(SimulationRecord.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    tx = db.query(Transaction).filter(Transaction.id == sim.transaction_id).first()
    pkt = db.query(Packet).filter(Packet.id == sim.packet_id).first()
    logs = db.query(SecurityLog).filter(SecurityLog.simulation_id == sim_id).all()
    
    steps = []
    try:
        steps = json.loads(sim.steps_json)
    except Exception:
        pass
        
    logs_out = []
    for l in logs:
        details = {}
        try:
            if l.details_json:
                details = json.loads(l.details_json)
        except Exception:
            pass
        logs_out.append({
            "timestamp": l.timestamp.strftime("%H:%M:%S.%f")[:-3] if l.timestamp else "",
            "stage": l.stage,
            "node": l.node,
            "event_type": l.event_type,
            "message": l.message,
            "details": details
        })
        
    return {
        "simulation_id": sim.id,
        "transaction_id": sim.transaction_id,
        "packet_id": sim.packet_id,
        "framing_method": sim.framing_method,
        "crc_algorithm": sim.crc_algorithm,
        "error_injected": sim.error_injected,
        "crc_verification_result": sim.crc_verification_result,
        "final_status": sim.final_status,
        "latency_ms": sim.latency_ms,
        "failure_reason": sim.failure_reason,
        "created_at": sim.created_at.isoformat() if sim.created_at else None,
        "transaction": {
            "id": tx.id if tx else None,
            "sender_account": tx.sender_account if tx else None,
            "receiver_account": tx.receiver_account if tx else None,
            "amount": tx.amount if tx else None,
            "transaction_type": tx.transaction_type if tx else None,
            "description": tx.description if tx else None,
            "status": tx.status if tx else None
        } if tx else None,
        "packet": {
            "id": pkt.id if pkt else None,
            "source": pkt.source if pkt else None,
            "destination": pkt.destination if pkt else None,
            "framing_method": pkt.framing_method if pkt else None,
            "crc_algorithm": pkt.crc_algorithm if pkt else None,
            "crc_value_hex": pkt.crc_value_hex if pkt else None,
            "crc_value_bin": pkt.crc_value_bin if pkt else None,
            "packet_size_bytes": pkt.packet_size_bytes if pkt else None,
            "transmission_status": pkt.transmission_status if pkt else None,
            "original_payload_hex": pkt.original_payload_hex if pkt else None,
            "framed_payload_hex": pkt.framed_payload_hex if pkt else None,
            "corrupted_payload_hex": pkt.corrupted_payload_hex if pkt else None,
            "corrupted_crc_hex": pkt.corrupted_crc_hex if pkt else None
        } if pkt else None,
        "steps": steps,
        "logs": logs_out
    }
