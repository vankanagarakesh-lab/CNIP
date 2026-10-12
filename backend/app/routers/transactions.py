"""Transactions API Router"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import Transaction
from ..schemas import TransactionCreateRequest

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("/")
def api_get_transactions(limit: int = 50, db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(desc(Transaction.created_at)).limit(limit).all()
    out = []
    for t in txs:
        out.append({
            "id": t.id,
            "sender_account": t.sender_account,
            "receiver_account": t.receiver_account,
            "amount": t.amount,
            "transaction_type": t.transaction_type,
            "description": t.description,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None
        })
    return out

@router.get("/{tx_id}")
def api_get_transaction(tx_id: str, db: Session = Depends(get_db)):
    t = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {
        "id": t.id,
        "sender_account": t.sender_account,
        "receiver_account": t.receiver_account,
        "amount": t.amount,
        "transaction_type": t.transaction_type,
        "description": t.description,
        "status": t.status,
        "created_at": t.created_at.isoformat() if t.created_at else None
    }
