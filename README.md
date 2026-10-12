# Secure Online Banking Data Transmission System
### Computer Networks Security & Error Detection Simulation

A full-stack, technically real educational simulator built for Computer Networks lab demonstrations and coursework. The application demonstrates real AES-256-GCM encryption, data link framing & stuffing (character framing, byte stuffing, bit stuffing), bitwise polynomial Cyclic Redundancy Check (CRC-12, CRC-16, CRC-CCITT), multi-hop network routing, channel noise injection, CRC error detection, de-stuffing, de-framing, and bank server verification.

---

## 1. Complete 18-Stage Architectural Workflow

The application implements this exact end-to-end data transmission pipeline:

```
CUSTOMER
   ↓
ENTER TRANSACTION
   ↓
VALIDATE DATA
   ↓
AES-256-GCM ENCRYPTION (256-bit Key, 96-bit Nonce, 128-bit Auth Tag)
   ↓
DATA PAYLOAD (Structured Binary Packaging)
   ↓
SELECT FRAMING
├── Character Framing (SOH/STX + Length Count + ETX/EOT)
├── Character Stuffing (DLE STX/ETX with DLE byte escaping)
└── Bit Stuffing (HDLC 01111110 flags + 0-bit insertion after 11111)
   ↓
CRC ENGINE
├── CRC-12    (Polynomial: x¹² + x¹¹ + x³ + x² + x + 1 => 0x180F)
├── CRC-16    (Polynomial: x¹⁶ + x¹⁵ + x² + 1 => 0x8005)
└── CRC-CCITT (Polynomial: x¹⁶ + x¹² + x⁵ + 1 => 0x1021)
   ↓
PACKET CREATION (Header + Framed Encrypted Payload + CRC Checksum)
   ↓
CLIENT NODE
   ↓
ROUTER (Next-Hop Routing & TTL Handling)
   ↓
FIREWALL (Educational State & Packet Structure Inspection)
   ↓
INTERNET (Public Channel WAN Traversal)
   ↓
ERROR INJECTION (Simulated Physical Layer Noise / Bit Flips)
├── ERROR INJECTED → Recalculated CRC ≠ Transmitted CRC → CRC FAIL → REJECT
└── NO ERROR       → Recalculated CRC = Transmitted CRC → CRC PASS → ACCEPT
   ↓
DE-STUFFING (Reverse Stuffing: Strip DLE escapes or remove stuffed 0s)
   ↓
DE-FRAMING (Remove Frame Delimiters & Restore Binary Payload)
   ↓
AES-256-GCM DECRYPTION (Auth Tag Verification & Plaintext Restoration)
   ↓
BANK SERVER
   ↓
TRANSACTION VERIFIED & SETTLED
```

---

## 2. Technologies Used

### Backend
* **Python 3.12+**
* **FastAPI**: Asynchronous high-performance REST API
* **Uvicorn**: ASGI web server
* **cryptography**: Real standard AES-256-GCM authenticated encryption/decryption
* **SQLAlchemy & SQLite**: Persistent relational database for transactions, packets, simulations, and logs
* **Pydantic v2**: Type validation and schema serialization
* **pytest**: Comprehensive automated test suite

### Frontend
* **React 19 & TypeScript**
* **Vite**: Ultra-fast frontend build tool
* **Tailwind CSS**: Glassmorphism and cyber cybersecurity theme styling
* **Lucide React**: Modern crisp network and hardware icons
* **Framer Motion**: Smooth node transitions and playback animation

---

## 3. Project Structure

```
cnip1/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Configuration & AES master key
│   │   ├── database.py            # SQLAlchemy SQLite connection
│   │   ├── models.py              # Database models (Transaction, Packet, Simulation, Logs)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── main.py                # FastAPI app & CORS configuration
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── encryption.py      # Real AES-256-GCM encryption & decryption
│   │   │   ├── framing.py         # Character framing, Byte stuffing, Bit stuffing
│   │   │   ├── crc.py             # Modulo-2 bitwise CRC-12, CRC-16, CRC-CCITT
│   │   │   ├── error_injection.py # Channel noise & single/multi bit corruption
│   │   │   └── simulator.py       # Full 18-stage end-to-end pipeline coordinator
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── simulation.py      # /api/simulations endpoints
│   │       ├── packets.py         # /api/packets endpoints
│   │       ├── transactions.py   # /api/transactions endpoints
│   │       └── algorithms.py      # Standalone algorithm test endpoints
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_encryption.py     # AES-256-GCM tests
│   │   ├── test_framing.py        # Framing & stuffing roundtrip tests
│   │   ├── test_crc.py            # CRC division & verification tests
│   │   ├── test_simulator.py      # End-to-end simulation happy/error path tests
│   │   └── test_api.py            # FastAPI REST endpoint tests
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                   # Top navigation & 1-click demo actions
│   │   │   ├── NetworkTopologyVisualizer.tsx # Glowing network node graph
│   │   │   ├── HexBinaryViewer.tsx          # Raw hex/binary/ASCII inspector
│   │   │   ├── CrcVisualizer.tsx            # Modulo-2 division trace visualizer
│   │   │   ├── LiveEventLog.tsx             # Real-time activity & security terminal
│   │   │   └── PacketDetailModal.tsx        # Deep packet inspector modal
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx                # Overview & quick stats
│   │   │   ├── NewTransaction.tsx           # Banking transaction builder form
│   │   │   ├── TransmissionSimulator.tsx    # 18-stage interactive live hero view
│   │   │   ├── PacketAnalyzer.tsx           # Packet table & structure viewer
│   │   │   ├── AlgorithmDetails.tsx         # Educational guide & CRC sandbox
│   │   │   └── SimulationHistory.tsx        # Persistent SQLite simulation logs
│   │   ├── services/
│   │   │   └── api.ts                       # Typed API client
│   │   ├── types/
│   │   │   └── index.ts                     # TypeScript data interfaces
│   │   ├── App.tsx                          # App shell & router
│   │   ├── index.css                        # Cyber glassmorphism styling
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## 4. Installation & Setup

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** with npm

### 1. Set Up Backend
```bash
cd backend
python -m pip install -r requirements.txt
```

### 2. Set Up Frontend
```bash
cd frontend
npm install
```

---

## 5. How to Run the Application

### Start the Backend Server (Port 8000)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend will be live at: `http://127.0.0.1:8000`
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`

### Start the Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
* Frontend will be live at: `http://127.0.0.1:5173`

---

## 6. Automated Testing

To run the complete automated test suite covering encryption, framing, CRC polynomials, error injection, end-to-end transmission, and API routes:

```bash
cd backend
python -m pytest tests -v
```

All 18 unit and integration tests validate the mathematical correctness and error detection capabilities.

---

## 7. Demonstration Instructions (For Evaluators & Professors)

### Mode 1: Successful Transmission (No Error)
1. In the top navbar, click **"DEMO: NO ERROR"** (or fill out the transaction form on **New Transaction** with "Noise: OFF").
2. The UI will transition to the **Transmission Simulator** page.
3. Observe:
   - **AES-256-GCM:** Plaintext transaction is encrypted with a fresh 96-bit nonce and 128-bit authentication tag.
   - **Framing:** Data is framed using the selected technique (e.g., Character Stuffing with DLE delimiters).
   - **CRC Calculation:** Sender computes the polynomial remainder (e.g., CRC-16 `0x...`).
   - **Transmission:** Packet travels through `CLIENT → ROUTER → FIREWALL → INTERNET → BANK SERVER`.
   - **CRC Verification:** Bank Server recomputes CRC on received data. Remainder matches transmitted CRC (`CRC PASS`).
   - **De-stuffing & De-framing:** Escaped characters/bits and boundary delimiters are stripped.
   - **Decryption:** AES-256-GCM verifies auth tag and recovers original plaintext.
   - **Bank Server:** Transaction is marked `VERIFIED & SETTLED` in green.

### Mode 2: Corrupted Transmission (Error Injected)
1. In the top navbar, click **"DEMO: INJECT ERROR"** (or toggle "Channel Noise" to **ON** in New Transaction).
2. The simulator starts transmitting the packet.
3. When traversing the **INTERNET** stage, channel noise inverts a specific bit in the frame payload.
4. When the packet arrives at the **BANK SERVER**:
   - The Bank Server computes the CRC on the received corrupted bitstream.
   - The computed CRC does **not** match the transmitted CRC (`CRC MISMATCH - FAIL`).
   - The pipeline immediately **halts**. The Bank Server rejects the packet and refuses to decrypt corrupted data.
   - A red alert appears: `TRANSMISSION FAILED: DATA INTEGRITY ERROR DETECTED BY CRC`.

---

## 8. Detailed Algorithm Explanations

### 1. AES-256-GCM (Authenticated Encryption)
- **Key:** 256 bits (32 bytes).
- **Nonce:** 96 bits (12 bytes), generated freshly using cryptographic RNG for every transaction to prevent replay attacks.
- **Auth Tag:** 128 bits (16 bytes), calculated in Galois Field GF(2¹²⁸) to detect any ciphertext tampering.

### 2. Character Framing (Byte Count)
- Delimits frames using ASCII control characters: `SOH` (0x01) + `STX` (0x02) at header, 2-byte length count, and `ETX` (0x03) + `EOT` (0x04) at trailer.

### 3. Character Stuffing (Byte Stuffing)
- Delimits frames with `DLE STX` (0x1002) and `DLE ETX` (0x1003).
- Whenever a `DLE` byte (0x10) appears inside the binary payload, an extra escape `DLE` is inserted (`0x10 → 0x10 0x10`).

### 4. Bit Stuffing (HDLC Protocol)
- Delimits frames with the standard HDLC flag pattern `01111110` (0x7E).
- In the payload bitstream, whenever five consecutive `1`s are encountered (`11111`), a `0` bit is stuffed immediately after (`111110`) to prevent accidental flag generation.

### 5. CRC Polynomials (Modulo-2 Polynomial Division)
- **CRC-12:** $x^{12} + x^{11} + x^3 + x^2 + x + 1$ (Divisor: `0x180F` / `1100000001111`, 12-bit remainder).
- **CRC-16 (IBM):** $x^{16} + x^{15} + x^2 + 1$ (Divisor: `0x18005` / `11000000000000101`, 16-bit remainder).
- **CRC-CCITT:** $x^{16} + x^{12} + x^5 + 1$ (Divisor: `0x11021` / `10001000000100001`, 16-bit remainder).

---

## 9. Implemented Features
- [x] Real AES-256-GCM authenticated encryption and decryption.
- [x] Real Character Framing, Character Stuffing, and Bit Stuffing implementations with reverse de-stuffing & de-framing.
- [x] Real bitwise Modulo-2 division CRC-12, CRC-16, and CRC-CCITT calculation & verification.
- [x] Real error injection engine with bit-level corruption and step-by-step reporting.
- [x] Full 18-stage interactive animated visualizer with Play/Pause/Speed controls.
- [x] Deep Packet Analyzer with Hex, Binary, and ASCII data stream breakdown.
- [x] Interactive CRC Sandbox and educational reference cards.
- [x] Persistent SQLite database tracking all transactions, packets, simulations, and security logs.
- [x] One-click demo buttons for clean success and error injection evaluation.
- [x] 100% passing automated test suite (`pytest`).

---

## 10. Educational & Scope Notes
- This is a Computer Networks academic simulation illustrating data link and network security concepts.
- Accounts (e.g. `DEMO-10001`) and currency transfers are simulated and do not connect to real-world banking rails.
