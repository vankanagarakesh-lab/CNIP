"""SQLAlchemy Database Models for Secure Banking Simulation"""
from datetime import datetime, timezone
import json
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, Integer, ForeignKey
from .database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, index=True)
    sender_account = Column(String(50), nullable=False)
    receiver_account = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(50), nullable=False, default="Fund Transfer")
    description = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="CREATED")  # CREATED, TRANSMITTED, REJECTED, VERIFIED
    created_at = Column(DateTime, default=utcnow)

class Packet(Base):
    __tablename__ = "packets"

    id = Column(String(50), primary_key=True, index=True)
    transaction_id = Column(String(50), ForeignKey("transactions.id"), nullable=False)
    source = Column(String(100), default="CLIENT_NODE_01")
    destination = Column(String(100), default="BANK_SERVER_SECURE")
    framing_method = Column(String(50), nullable=False)
    crc_algorithm = Column(String(50), nullable=False)
    crc_value_hex = Column(String(50), nullable=False)
    crc_value_bin = Column(String(100), nullable=False)
    original_payload_hex = Column(Text, nullable=False)
    framed_payload_hex = Column(Text, nullable=False)
    error_injected = Column(Boolean, default=False)
    corrupted_payload_hex = Column(Text, nullable=True)
    corrupted_crc_hex = Column(String(50), nullable=True)
    packet_size_bytes = Column(Integer, nullable=False)
    transmission_status = Column(String(50), nullable=False)  # ACCEPTED, REJECTED
    created_at = Column(DateTime, default=utcnow)

class SimulationRecord(Base):
    __tablename__ = "simulations"

    id = Column(String(50), primary_key=True, index=True)
    transaction_id = Column(String(50), nullable=False)
    packet_id = Column(String(50), nullable=False)
    framing_method = Column(String(50), nullable=False)
    crc_algorithm = Column(String(50), nullable=False)
    error_injected = Column(Boolean, default=False)
    crc_verification_result = Column(String(50), nullable=False)  # PASS, FAIL
    final_status = Column(String(50), nullable=False)  # SUCCESSFUL, REJECTED
    latency_ms = Column(Float, default=0.0)
    failure_reason = Column(String(255), nullable=True)
    steps_json = Column(Text, nullable=False)  # JSON-serialized steps list
    created_at = Column(DateTime, default=utcnow)

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=utcnow)
    simulation_id = Column(String(50), nullable=True, index=True)
    stage = Column(String(100), nullable=False)
    node = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False)  # INFO, SECURITY, ALERT, SUCCESS, ERROR
    message = Column(Text, nullable=False)
    details_json = Column(Text, nullable=True)
