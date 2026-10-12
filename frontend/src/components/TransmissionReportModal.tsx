import React from 'react';
import { X, CheckCircle2, XCircle, FileText, Lock, Layers, Cpu, Globe, Printer } from 'lucide-react';
import type { SimulationResult } from '../types';

interface TransmissionReportModalProps {
  simulation: SimulationResult;
  onClose: () => void;
}

export const TransmissionReportModal: React.FC<TransmissionReportModalProps> = ({ simulation, onClose }) => {
  const isSuccess = simulation.final_status === 'SUCCESSFUL';
  const origTx = simulation.original_transaction || {};
  const pkt = simulation.packet_summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-200 font-sans space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-100 font-mono">Transmission Security & Integrity Audit Report</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                SIM ID: <span className="text-cyan-300">{simulation.simulation_id}</span> • TXN: <span className="text-purple-300">{simulation.transaction_id}</span> • PKT: <span className="text-blue-300">{simulation.packet_id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Print Audit Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Verdict Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isSuccess
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-950/40'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-200 shadow-lg shadow-rose-950/40'
        }`}>
          <div className="flex items-center gap-3">
            {isSuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-rose-400" />}
            <div>
              <h4 className="font-bold font-mono text-sm uppercase">
                {isSuccess ? 'TRANSMISSION VERIFIED & COMPLETED' : 'TRANSMISSION TERMINATED / REJECTED'}
              </h4>
              <p className="text-xs opacity-80 font-sans">
                {isSuccess
                  ? 'All 18 stages executed successfully. AES-256-GCM authenticated, CRC verification passed, Bank Server settled transaction.'
                  : `Data Link error detection triggered. ${simulation.failure_reason || 'CRC Checksum mismatch detected bit corruption.'}`}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-950/80 border border-current">
            {simulation.latency_ms} ms Latency
          </span>
        </div>

        {/* 4 Pillars Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          {/* Pillar 1: Cryptographic Layer */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4" />
              <span>1. Cryptography (AES-256-GCM)</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-400">Cipher:</span><span>AES-256-GCM (AEAD)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Key Security:</span><span>256 bits (32 Bytes)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Fresh Nonce:</span><span>96 bits (12 Bytes)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Auth Tag:</span><span>128 bits (16 Bytes)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Decryption:</span><span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{isSuccess ? 'AUTHENTICATED' : 'HALTED (Untrusted)'}</span></div>
            </div>
          </div>

          {/* Pillar 2: Data Link Framing */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4" />
              <span>2. Framing & Stuffing Layer</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-400">Method:</span><span className="font-bold text-purple-300">{simulation.framing_method}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Packet Total Size:</span><span>{pkt.packet_size_bytes} Bytes</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Framing Overhead:</span><span>Attached Headers & Trailers</span></div>
              <div className="flex justify-between"><span className="text-slate-400">De-stuffing Status:</span><span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{isSuccess ? 'REVERSED & VERIFIED' : 'SKIPPED'}</span></div>
            </div>
          </div>

          {/* Pillar 3: CRC Error Detection */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span>3. Error Detection (CRC Engine)</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-400">Algorithm:</span><span className="font-bold text-sky-300">{simulation.crc_algorithm}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Sender CRC Checksum:</span><span className="text-cyan-300 font-bold">0x{pkt.crc_value_hex}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Receiver Computed CRC:</span><span className={isSuccess ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold'}>0x{pkt.corrupted_crc_hex || pkt.crc_value_hex}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Verification Result:</span><span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{simulation.crc_verification_result}</span></div>
            </div>
          </div>

          {/* Pillar 4: Physical Channel & Noise */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-2">
              <Globe className="w-4 h-4" />
              <span>4. Channel Noise Forensics</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-400">Noise Injection:</span><span className={simulation.error_injected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{simulation.error_injected ? 'ACTIVE (Corrupted)' : 'CLEAN (No Noise)'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Channel Path:</span><span>Client → Router → Firewall → WAN</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Integrity Violation:</span><span className={simulation.error_injected ? 'text-rose-400' : 'text-emerald-400'}>{simulation.error_injected ? 'DETECTED & BLOCKED' : 'NONE DETECTED'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Settlement Status:</span><span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{isSuccess ? 'SETTLED' : 'REJECTED'}</span></div>
            </div>
          </div>

        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Sender → Receiver</span>
            <span className="font-bold text-slate-100">{origTx.sender_account} → {origTx.receiver_account}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Transaction Type</span>
            <span className="font-bold text-cyan-300">{origTx.transaction_type}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Transfer Amount</span>
            <span className="text-base font-extrabold text-emerald-400">₹{origTx.amount}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
