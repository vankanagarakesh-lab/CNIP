import React, { useState } from 'react';
import { Lock, Layers, Cpu, Terminal } from 'lucide-react';
import { calculateStandaloneCrc } from '../services/api';
import { CrcVisualizer } from '../components/CrcVisualizer';

export const AlgorithmDetails: React.FC = () => {
  // Live Sandbox state
  const [sandboxInput, setSandboxInput] = useState<string>('SECURE BANK TRANSFER ₹5000');
  const [selectedAlgo, setSelectedAlgo] = useState<string>('CRC_16');
  const [sandboxCrcResult, setSandboxCrcResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runSandboxCrc = async () => {
    try {
      setLoading(true);
      // Convert string to hex
      const hex = Array.from(new TextEncoder().encode(sandboxInput))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const res = await calculateStandaloneCrc(hex, selectedAlgo);
      setSandboxCrcResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>Computer Networks Theory & Mathematics</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">Algorithm Technical Reference</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Comprehensive beginner-friendly and mathematical breakdown of all security and data link layer algorithms implemented in this project.
        </p>
      </div>

      {/* 1. AES-256-GCM */}
      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-6 glass-card shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">AES-256-GCM (Galois/Counter Mode)</h3>
            <p className="text-xs text-cyan-400 font-mono">Authenticated Symmetric Encryption • FIPS 197 / NIST SP 800-38D</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">How It Works</h4>
            <p>
              AES-256-GCM is an Authenticated Encryption with Associated Data (AEAD) algorithm. It provides both <strong>confidentiality</strong> (encryption) and <strong>authenticity/integrity</strong> (tamper proofing) in a single high-speed cryptographic pass.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>256-bit Key:</strong> Maximum symmetric security against brute-force attacks.</li>
              <li><strong>96-bit Nonce:</strong> Fresh pseudo-random initialization vector generated for every transaction.</li>
              <li><strong>128-bit Authentication Tag:</strong> Cryptographic tag computed over ciphertext using universal hashing in Galois Field GF(2¹²⁸).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2">
            <h5 className="font-bold text-cyan-300 text-[11px] uppercase">Cryptographic Parameters in System</h5>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Cipher Mode:</span>
              <span className="text-slate-200">GCM (Galois Counter Mode)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Key Length:</span>
              <span className="text-slate-200">32 Bytes (256 bits)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span className="text-slate-400">Nonce Length:</span>
              <span className="text-slate-200">12 Bytes (96 bits)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Auth Tag Length:</span>
              <span className="text-slate-200">16 Bytes (128 bits)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Framing & Stuffing Methods */}
      <div className="rounded-2xl border border-purple-500/20 bg-slate-950/80 p-6 glass-card shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Data Link Layer Framing & Stuffing</h3>
            <p className="text-xs text-purple-400 font-mono">Frame Delimitation, Byte Escaping, and Bit Stuffing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Method 1: Character Framing */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Method 1
            </span>
            <h4 className="font-bold text-slate-100 text-sm">Character Framing</h4>
            <p className="text-slate-400 leading-relaxed">
              Uses reserved control characters <code>SOH</code> (0x01) + <code>STX</code> (0x02) at start and <code>ETX</code> (0x03) + <code>EOT</code> (0x04) at end, combined with a 2-byte length count prefix.
            </p>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-purple-300">
              [SOH STX] + [LEN: 2B] + [PAYLOAD] + [ETX EOT]
            </div>
          </div>

          {/* Method 2: Character Stuffing */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Method 2
            </span>
            <h4 className="font-bold text-slate-100 text-sm">Character Stuffing</h4>
            <p className="text-slate-400 leading-relaxed">
              Delimits frames with <code>DLE STX</code> (0x1002) and <code>DLE ETX</code> (0x1003). If the binary payload naturally contains a <code>DLE</code> byte (0x10), an extra escape <code>DLE</code> is inserted.
            </p>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-purple-300">
              Rule: 0x10 → 0x10 0x10 (Escape DLE)
            </div>
          </div>

          {/* Method 3: Bit Stuffing */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Method 3
            </span>
            <h4 className="font-bold text-slate-100 text-sm">Bit Stuffing (HDLC)</h4>
            <p className="text-slate-400 leading-relaxed">
              Encloses frames with Flag sequence <code>01111110</code> (0x7E). In the bitstream, whenever five consecutive '1's appear (<code>11111</code>), a '0' bit is stuffed (<code>111110</code>).
            </p>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-purple-300">
              Rule: 11111 → 111110 (Stuffed 0)
            </div>
          </div>
        </div>
      </div>

      {/* 3. CRC Error Detection Engine */}
      <div className="rounded-2xl border border-blue-500/20 bg-slate-950/80 p-6 glass-card shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Cyclic Redundancy Check (CRC) Polynomials</h3>
            <p className="text-xs text-blue-400 font-mono">Modulo-2 Polynomial Division & Error Detection Mathematics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 text-sm font-sans">CRC-12</h4>
            <p className="text-cyan-400 text-[11px]">x¹² + x¹¹ + x³ + x² + x + 1</p>
            <p className="text-slate-400 font-sans leading-relaxed">
              12-bit checksum remainder used for 6-bit character streams and industrial telemetry protocols. Divisor binary: <code>1100000001111</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 text-sm font-sans">CRC-16 (IBM)</h4>
            <p className="text-cyan-400 text-[11px]">x¹⁶ + x¹⁵ + x² + 1</p>
            <p className="text-slate-400 font-sans leading-relaxed">
              16-bit checksum remainder widely adopted in USB, Modbus, ANSI, and Bisync data communications. Divisor binary: <code>11000000000000101</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 text-sm font-sans">CRC-CCITT</h4>
            <p className="text-cyan-400 text-[11px]">x¹⁶ + x¹² + x⁵ + 1</p>
            <p className="text-slate-400 font-sans leading-relaxed">
              Standard 16-bit ITU-T V.41 / X.25 polynomial used in HDLC, Bluetooth, and cellular telemetry. Divisor binary: <code>10001000000100001</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Live Interactive CRC Calculator Sandbox */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-6 glass-card shadow-2xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
            Interactive CRC Calculator Sandbox
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Input String Data to Checksum:
            </label>
            <input
              type="text"
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
              placeholder="Type any message..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Polynomial:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedAlgo}
                onChange={(e) => setSelectedAlgo(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="CRC_12">CRC-12</option>
                <option value="CRC_16">CRC-16</option>
                <option value="CRC_CCITT">CRC-CCITT</option>
              </select>

              <button
                type="button"
                onClick={runSandboxCrc}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shrink-0"
              >
                {loading ? '...' : 'Compute'}
              </button>
            </div>
          </div>
        </div>

        {sandboxCrcResult && (
          <div className="pt-2">
            <CrcVisualizer
              algorithm={sandboxCrcResult.algorithm}
              algorithmName={sandboxCrcResult.algorithm_name}
              polynomial={sandboxCrcResult.polynomial}
              polyHex={sandboxCrcResult.poly_hex}
              crcHex={sandboxCrcResult.crc_hex}
              crcBin={sandboxCrcResult.crc_bin}
              calculationTrace={sandboxCrcResult.calculation_trace}
            />
          </div>
        )}
      </div>

    </div>
  );
};
