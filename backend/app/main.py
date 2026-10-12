"""FastAPI Main Application for Secure Online Banking Data Transmission System"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .config import APP_NAME, VERSION
from .database import engine, Base, get_db
from .models import Transaction, Packet, SimulationRecord, SecurityLog
from .routers import simulation, packets, transactions, algorithms

# Create all database tables immediately
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=APP_NAME,
    description="Computer Networks Security & Error Detection Educational Simulation",
    version=VERSION
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(simulation.router)
app.include_router(packets.router)
app.include_router(transactions.router)
app.include_router(algorithms.router)

@app.get("/api/health")
def api_health():
    return {
        "status": "healthy",
        "app": APP_NAME,
        "version": VERSION,
        "security_engine": "AES-256-GCM (Active)",
        "crc_engine": "Bitwise Modulo-2 (Active)"
    }

@app.get("/api/dashboard/stats")
def api_dashboard_stats(db: Session = Depends(get_db)):
    total_tx = db.query(Transaction).count()
    total_pkts = db.query(Packet).count()
    successful_sims = db.query(SimulationRecord).filter(SimulationRecord.final_status == "SUCCESSFUL").count()
    rejected_sims = db.query(SimulationRecord).filter(SimulationRecord.final_status == "REJECTED").count()
    
    recent_sims = db.query(SimulationRecord).order_by(desc(SimulationRecord.created_at)).limit(5).all()
    recent_sims_out = [
        {
            "simulation_id": s.id,
            "transaction_id": s.transaction_id,
            "packet_id": s.packet_id,
            "framing_method": s.framing_method,
            "crc_algorithm": s.crc_algorithm,
            "error_injected": s.error_injected,
            "crc_verification_result": s.crc_verification_result,
            "final_status": s.final_status,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in recent_sims
    ]
    
    recent_logs = db.query(SecurityLog).order_by(desc(SecurityLog.timestamp)).limit(10).all()
    recent_logs_out = [
        {
            "timestamp": l.timestamp.strftime("%H:%M:%S") if l.timestamp else "",
            "node": l.node,
            "event_type": l.event_type,
            "message": l.message
        }
        for l in recent_logs
    ]
    
    return {
        "total_transactions": total_tx,
        "total_packets": total_pkts,
        "successful_transmissions": successful_sims,
        "rejected_transmissions": rejected_sims,
        "recent_simulations": recent_sims_out,
        "recent_logs": recent_logs_out
    }
