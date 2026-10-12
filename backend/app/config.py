"""Application Configuration"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    # Load from backend root directory or current directory
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

SECRET_AES_KEY = os.environ.get(
    "SECURE_BANKING_AES_KEY",
    "4f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"  # 32-byte hex key (256-bit)
)

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./banking_simulation.db"
)

APP_NAME = "Secure Online Banking Data Transmission System"
VERSION = "1.0.0"
