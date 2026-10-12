"""Packet Analyzer and lookup API Router"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import Packet

router = APIRouter(prefix="/api/packets", tags=["Packets"])

@router.get("/")
def api_get_packets(limit: int = 50, db: Session = Depends(get_db)):
    packets = db.query(Packet).order_by(desc(Packet.created_at)).limit(limit).all()
    out = []
    for p in packets:
        out.append({
            "packet_id": p.id,
            "transaction_id": p.transaction_id,
            "source": p.source,
            "destination": p.destination,
            "framing_method": p.framing_method,
            "crc_algorithm": p.crc_algorithm,
            "crc_value_hex": p.crc_value_hex,
            "crc_value_bin": p.crc_value_bin,
            "packet_size_bytes": p.packet_size_bytes,
            "error_injected": p.error_injected,
            "transmission_status": p.transmission_status,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return out

@router.get("/{packet_id}")
def api_get_packet_detail(packet_id: str, db: Session = Depends(get_db)):
    p = db.query(Packet).filter(Packet.id == packet_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Packet not found")
        
    return {
        "packet_id": p.id,
        "transaction_id": p.transaction_id,
        "source": p.source,
        "destination": p.destination,
        "framing_method": p.framing_method,
        "crc_algorithm": p.crc_algorithm,
        "crc_value_hex": p.crc_value_hex,
        "crc_value_bin": p.crc_value_bin,
        "packet_size_bytes": p.packet_size_bytes,
        "error_injected": p.error_injected,
        "transmission_status": p.transmission_status,
        "original_payload_hex": p.original_payload_hex,
        "framed_payload_hex": p.framed_payload_hex,
        "corrupted_payload_hex": p.corrupted_payload_hex,
        "corrupted_crc_hex": p.corrupted_crc_hex,
        "created_at": p.created_at.isoformat() if p.created_at else None
    }
