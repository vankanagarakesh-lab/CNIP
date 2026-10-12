import React from 'react';
import { X, Package, Layers, AlertTriangle } from 'lucide-react';
import { HexBinaryViewer } from './HexBinaryViewer';

interface PacketDetailModalProps {
  packet: any;
  onClose: () => void;
}

export const PacketDetailModal: React.FC<PacketDetailModalProps> = ({ packet, onClose }) => {
  if (!packet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 font-mono">{packet.packet_id || packet.id}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  packet.transmission_status === 'ACCEPTED' || packet.transmission_status === 'SUCCESSFUL'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {packet.transmission_status || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Associated Transaction: <span className="font-mono text-cyan-300">{packet.transaction_id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Source Node</span>
            <span className="text-cyan-300 font-semibold">{packet.source || 'CLIENT_NODE_01'}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Destination</span>
            <span className="text-blue-300 font-semibold">{packet.destination || 'BANK_SERVER_SECURE'}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">Framing Method</span>
            <span className="text-purple-300 font-semibold">{packet.framing_method}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">CRC Checksum</span>
            <span className="text-emerald-300 font-bold">0x{packet.crc_value_hex} ({packet.crc_algorithm})</span>
          </div>
        </div>

        {/* Packet Structure Breakdown */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Packet Structure Breakdown
          </h4>

          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs font-mono">
            {/* Header section */}
            <div className="bg-slate-900/90 p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-cyan-400 font-bold">[HEADER]</span>
              <span className="text-slate-400">Source: {packet.source} → Dest: {packet.destination}</span>
            </div>

            {/* Payload section */}
            <div className="bg-slate-950 p-3 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-bold">[PAYLOAD (AES-256-GCM + Framing)]</span>
                <span className="text-slate-400">{packet.packet_size_bytes} Bytes</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Encrypted ciphertext packaged with 96-bit Nonce and 128-bit Authentication Tag.
              </p>
            </div>

            {/* Checksum trailer section */}
            <div className="bg-slate-900/90 p-3 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">[TRAILER / CRC CHECKSUM]</span>
              <span className="text-emerald-300 font-bold">0x{packet.crc_value_hex}</span>
            </div>
          </div>
        </div>

        {/* Hex/Binary Viewers */}
        <div className="space-y-4">
          <HexBinaryViewer
            title="Framed Packet Payload (Hex & Binary)"
            hexData={packet.framed_payload_hex || packet.original_payload_hex || ''}
          />

          {packet.corrupted_payload_hex && (
            <div className="border border-rose-500/30 rounded-xl p-3 bg-rose-950/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Corrupted Payload After Channel Noise</span>
              </div>
              <HexBinaryViewer
                title="Received Corrupted Data (Hex)"
                hexData={packet.corrupted_payload_hex}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
