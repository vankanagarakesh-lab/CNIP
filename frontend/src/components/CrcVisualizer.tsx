import React from 'react';
import { Cpu, CheckCircle2, XCircle, ArrowDown } from 'lucide-react';

interface CrcVisualizerProps {
  algorithm: string;
  algorithmName?: string;
  polynomial?: string;
  polyHex?: string;
  crcHex: string;
  crcBin: string;
  calculationTrace?: Array<{
    step: number;
    bit_position: number;
    dividend_segment: string;
    divisor_polynomial: string;
    xor_result: string;
  }>;
  verification?: {
    receivedCrc: string;
    calculatedCrc: string;
    isValid: boolean;
  };
}

export const CrcVisualizer: React.FC<CrcVisualizerProps> = ({
  algorithm,
  algorithmName = 'CRC Engine',
  polynomial = 'x¹⁶ + x¹⁵ + x² + 1',
  polyHex = '0x8005',
  crcHex,
  crcBin,
  calculationTrace = [],
  verification,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono space-y-3 shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-sm">{algorithmName} ({algorithm})</h4>
            <p className="text-[11px] text-cyan-400 font-sans">Generator: {polynomial} ({polyHex})</p>
          </div>
        </div>

        {verification && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            verification.isValid
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {verification.isValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CRC MATCH (PASS)</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>CRC MISMATCH (FAIL)</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Generated / Recalculated CRC Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block mb-1">Generated CRC (Hex):</span>
          <span className="text-cyan-300 text-sm font-bold tracking-wider">0x{crcHex}</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block mb-1">Binary Checksum Remainder:</span>
          <span className="text-sky-400 text-xs tracking-widest break-all">{crcBin}</span>
        </div>
      </div>

      {/* Educational Modulo-2 Division Trace */}
      {calculationTrace.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-sans">
            <ArrowDown className="w-3 h-3 text-cyan-400" />
            <span>Bitwise Modulo-2 Polynomial Division Trace (First {calculationTrace.length} Steps):</span>
          </div>

          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 space-y-2 overflow-x-auto">
            {calculationTrace.map((step) => (
              <div key={step.step} className="text-[11px] font-mono leading-tight pl-2 border-l-2 border-cyan-500/40">
                <span className="text-slate-400 text-[10px] block">Step {step.step} (Bit pos: {step.bit_position}):</span>
                <div className="text-slate-300">Dividend: <span className="text-sky-300">{step.dividend_segment}</span></div>
                <div className="text-slate-400">Divisor : <span className="text-amber-400">⊕ {step.divisor_polynomial}</span></div>
                <div className="text-emerald-400 font-semibold">Result  : {step.xor_result}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
