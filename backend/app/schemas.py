"""Pydantic Request & Response Schemas"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

class TransactionCreateRequest(BaseModel):
    sender_account: str = Field(..., min_length=3, max_length=30, json_schema_extra={"example": "DEMO-10001"})
    receiver_account: str = Field(..., min_length=3, max_length=30, json_schema_extra={"example": "DEMO-20002"})
    amount: float = Field(..., gt=0, json_schema_extra={"example": 5000.0})
    transaction_type: str = Field(default="Fund Transfer", json_schema_extra={"example": "Fund Transfer"})
    description: Optional[str] = Field(default="College Fee Payment", max_length=200)

    @field_validator("sender_account", "receiver_account")
    @classmethod
    def validate_accounts(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("Account cannot be empty")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return round(v, 2)

class SimulationRequest(BaseModel):
    transaction: TransactionCreateRequest
    framing_method: str = Field(default="CHARACTER_STUFFING") # CHARACTER_FRAMING, CHARACTER_STUFFING, BIT_STUFFING
    crc_algorithm: str = Field(default="CRC_16")            # CRC_12, CRC_16, CRC_CCITT
    inject_error: bool = Field(default=False)
    error_bit_position: Optional[int] = Field(default=None)

class SimulationStep(BaseModel):
    step_number: int
    stage: str
    title: str
    node: str # CUSTOMER, CLIENT, ROUTER, FIREWALL, INTERNET, BANK_SERVER
    status: str # SUCCESS, WARNING, ERROR, INFO
    timestamp: str
    summary: str
    technical_details: Dict[str, Any]

class SimulationResponse(BaseModel):
    simulation_id: str
    transaction_id: str
    packet_id: str
    framing_method: str
    crc_algorithm: str
    error_injected: bool
    crc_verification_result: str # PASS, FAIL
    final_status: str # SUCCESSFUL, REJECTED
    failure_reason: Optional[str] = None
    original_transaction: Dict[str, Any]
    recovered_transaction: Optional[Dict[str, Any]] = None
    packet_summary: Dict[str, Any]
    steps: List[SimulationStep]
    logs: List[Dict[str, Any]]
    latency_ms: Optional[float] = 0.0

class DashboardStats(BaseModel):
    total_transactions: int
    total_packets: int
    successful_transmissions: int
    rejected_transmissions: int
    recent_simulations: List[Dict[str, Any]]
    recent_logs: List[Dict[str, Any]]
