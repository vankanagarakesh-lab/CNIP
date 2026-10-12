import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface HexBinaryViewerProps {
  title?: string;
  hexData: string;
  binaryData?: string;
  highlightIndices?: number[];
  maxDisplayBytes?: number;
}

export const HexBinaryViewer: React.FC<HexBinaryViewerProps> = ({
  title = 'Raw Binary / Hex Data',
  hexData,
  highlightIndices = [],
  maxDisplayBytes = 64,
}) => {
  const [viewMode, setViewMode] = useState<'hex' | 'binary' | 'ascii'>('hex');
  const [copied, setCopied] = useState(false);

  // Clean hex data
  const cleanHex = (hexData || '').replace(/\s+/g, '').toUpperCase();
  const bytes: string[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(cleanHex.substring(i, i + 2));
  }

  const displayedBytes = bytes.slice(0, maxDisplayBytes);
  const isTruncated = bytes.length > maxDisplayBytes;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cleanHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAsciiRepresentation = (hexByte: string) => {
    try {
      const code = parseInt(hexByte, 16);
      if (code >= 32 && code <= 126) {
        return String.fromCharCode(code);
      }
      return '·';
    } catch {
      return '·';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 font-mono text-xs shadow-inner">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{title}</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
            {bytes.length} bytes ({bytes.length * 8} bits)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('hex')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                viewMode === 'hex' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              HEX
            </button>
            <button
              onClick={() => setViewMode('binary')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                viewMode === 'binary' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              BIN
            </button>
            <button
              onClick={() => setViewMode('ascii')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                viewMode === 'ascii' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              ASCII
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
            title="Copy Hex"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main data stream view */}
      {viewMode === 'hex' && (
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 p-2 bg-slate-900/50 rounded-lg max-h-48 overflow-y-auto">
          {displayedBytes.map((b, idx) => {
            const isHighlighted = highlightIndices.includes(idx);
            return (
              <span
                key={idx}
                className={`text-center py-0.5 px-1 rounded transition-colors ${
                  isHighlighted
                    ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/50 animate-pulse'
                    : 'text-cyan-300/90 hover:bg-slate-800'
                }`}
                title={`Byte #${idx} (Dec: ${parseInt(b, 16)}, Bin: ${parseInt(b, 16).toString(2).padStart(8, '0')})`}
              >
                {b}
              </span>
            );
          })}
        </div>
      )}

      {viewMode === 'binary' && (
        <div className="space-y-1 p-2 bg-slate-900/50 rounded-lg max-h-48 overflow-y-auto text-[11px]">
          {displayedBytes.slice(0, 16).map((b, idx) => {
            const binStr = parseInt(b, 16).toString(2).padStart(8, '0');
            return (
              <div key={idx} className="flex items-center justify-between text-slate-400 hover:bg-slate-800/40 px-1 py-0.5 rounded">
                <span className="text-slate-500 w-16">[{idx.toString().padStart(3, '0')}] 0x{b}</span>
                <span className="text-sky-300 font-mono tracking-widest">{binStr.slice(0, 4)} {binStr.slice(4)}</span>
                <span className="text-slate-400 font-sans">'{getAsciiRepresentation(b)}'</span>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'ascii' && (
        <div className="p-2 bg-slate-900/50 rounded-lg max-h-48 overflow-y-auto break-all text-slate-300 leading-relaxed">
          {displayedBytes.map((b) => getAsciiRepresentation(b)).join('')}
        </div>
      )}

      {isTruncated && (
        <p className="text-[10px] text-slate-400 mt-1.5 text-right">
          ... truncated (+{bytes.length - maxDisplayBytes} more bytes)
        </p>
      )}
    </div>
  );
};
