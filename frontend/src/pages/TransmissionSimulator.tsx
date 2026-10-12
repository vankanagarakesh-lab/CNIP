import React, { useState, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, FastForward, CheckCircle2, XCircle, AlertTriangle,
  Lock, Unlock, Layers, Cpu, Shield, Globe, Landmark, Terminal,
  User, Laptop, Radio, Database, Eye, ArrowLeft, ArrowRight, BookOpen, Zap, FileText
} from 'lucide-react';
import type { SimulationResult } from '../types';
import { NetworkTopologyVisualizer } from '../components/NetworkTopologyVisualizer';
import { HexBinaryViewer } from '../components/HexBinaryViewer';
import { CrcVisualizer } from '../components/CrcVisualizer';
import { LiveEventLog } from '../components/LiveEventLog';
import { PacketDetailModal } from '../components/PacketDetailModal';
import { TransmissionReportModal } from '../components/TransmissionReportModal';

interface TransmissionSimulatorProps {
  simulationData: SimulationResult | null;
  onRestart: () => void;
  onNewTransaction: () => void;
  onToggleErrorDemo: (injectError: boolean) => void;
}

export const TransmissionSimulator: React.FC<TransmissionSimulatorProps> = ({
  simulationData,
  onNewTransaction,
  onToggleErrorDemo,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [mode, setMode] = useState<'AUTO' | 'STEP_BY_STEP'>('AUTO');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1400); // ms per step
  const [showPacketModal, setShowPacketModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const steps = simulationData?.steps || [];
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIdx] || null;

  // Auto playback effect in AUTO mode
  useEffect(() => {
    let timer: any = null;
    if (mode === 'AUTO' && isPlaying && totalSteps > 0 && currentStepIdx < totalSteps - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, playbackSpeed);
    } else if (currentStepIdx >= totalSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [mode, isPlaying, currentStepIdx, totalSteps, playbackSpeed]);

  if (!simulationData || totalSteps === 0) {
    return (
      <div className="text-center py-20 rounded-3xl border border-slate-800 bg-slate-950/80 glass-card p-8 space-y-4 max-w-2xl mx-auto">
        <Shield className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-slate-100">No Simulation In Progress</h3>
        <p className="text-xs text-slate-400">
          Enter a new transaction or launch one of the rapid demonstration modes to see the live end-to-end packet transmission.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onToggleErrorDemo(false)}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 cursor-pointer"
          >
            Launch Clean Demo (No Error)
          </button>
          <button
            onClick={() => onToggleErrorDemo(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 cursor-pointer"
          >
            Launch Corrupted Demo (Error)
          </button>
        </div>
      </div>
    );
  }

  const isComplete = currentStepIdx === totalSteps - 1;
  const isRejected = simulationData.final_status === 'REJECTED';

  // Stage Icons Map
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'CUSTOMER': return User;
      case 'ENTER_TRANSACTION': return Terminal;
      case 'VALIDATE_DATA': return CheckCircle2;
      case 'AES_ENCRYPTION': return Lock;
      case 'DATA_PAYLOAD': return Database;
      case 'SELECT_FRAMING': return Layers;
      case 'CRC_ENGINE': return Cpu;
      case 'PACKET_CREATION': return Database;
      case 'CLIENT_TRANSMIT': return Laptop;
      case 'ROUTER': return Radio;
      case 'FIREWALL': return Shield;
      case 'INTERNET': return Globe;
      case 'ERROR_INJECTION': return AlertTriangle;
      case 'CRC_VERIFICATION': return Cpu;
      case 'DE_STUFFING': return Layers;
      case 'DE_FRAMING': return Layers;
      case 'DECRYPTION': return Unlock;
      case 'BANK_SERVER_VERIFIED': return Landmark;
      default: return Shield;
    }
  };

  const getStepEducationalExplanation = (stage: string) => {
    switch (stage) {
      case 'CUSTOMER':
        return 'The customer initializes a funds transfer from their fictional banking profile.';
      case 'ENTER_TRANSACTION':
        return 'Parameters are serialized into structured JSON format on the client application.';
      case 'VALIDATE_DATA':
        return 'Client-side verification ensures the sender and receiver accounts are distinct and the transfer amount is positive.';
      case 'AES_ENCRYPTION':
        return 'AES-256 in Galois/Counter Mode (GCM) encrypts the transaction using a 256-bit key, a unique 96-bit nonce, and computes a 128-bit authentication tag.';
      case 'DATA_PAYLOAD':
        return 'The binary payload is packed as: [Nonce 12B] + [Auth Tag 16B] + [Ciphertext NB].';
      case 'SELECT_FRAMING':
        return 'The selected Data Link framing/stuffing protocol encapsulates the payload with synchronization flags or delimiters and applies byte/bit stuffing rules.';
      case 'CRC_ENGINE':
        return 'Bitwise Modulo-2 polynomial division is performed on the binary stream to generate an error-detecting checksum remainder.';
      case 'PACKET_CREATION':
        return 'The physical packet is assembled with routing headers, framed payload, and the computed CRC checksum.';
      case 'CLIENT_TRANSMIT':
        return 'Client Network Interface Card queues and dispatches the packet onto the local network segment.';
      case 'ROUTER':
        return 'Gateway router inspects destination IP, consults routing tables, decrements TTL, and forwards packet to next hop.';
      case 'FIREWALL':
        return 'Stateful security firewall inspects packet headers and port policies (Port 443 TLS/HTTPS).';
      case 'INTERNET':
        return 'Packet traverses public Wide Area Network (WAN) routing infrastructure.';
      case 'ERROR_INJECTION':
        return 'Simulates physical layer channel noise or electromagnetic interference by inverting bits in the transmitted frame.';
      case 'CRC_VERIFICATION':
        return 'Bank Server re-runs Modulo-2 polynomial division on the received payload and compares the result with the transmitted checksum.';
      case 'DE_STUFFING':
        return 'Bank Server reverses the stuffing algorithm by stripping escape control characters or stuffed zero bits.';
      case 'DE_FRAMING':
        return 'Frame delimiters and boundary markers are stripped to restore the exact encrypted payload.';
      case 'DECRYPTION':
        return 'AES-256-GCM verifies the 128-bit authentication tag to ensure zero tampering, then decrypts the ciphertext back to JSON.';
      case 'BANK_SERVER_VERIFIED':
        return 'Bank Server finalizes the fund transfer, debits the sender, credits the receiver, and stores the transaction in SQLite.';
      case 'TRANSMISSION_FAILED':
        return 'Bank Server rejects the packet due to CRC mismatch, halting decryption to prevent corrupted data processing.';
      default:
        return 'Data Link & Network processing step.';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Controls Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 glass-card shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Simulation identifiers */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm font-mono">
                {simulationData.transaction_id}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                ({simulationData.simulation_id})
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isRejected
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {simulationData.final_status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Framing: <span className="text-purple-300 font-mono">{simulationData.framing_method}</span> • CRC:{' '}
              <span className="text-cyan-300 font-mono">{simulationData.crc_algorithm}</span> • Noise:{' '}
              <span className={simulationData.error_injected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {simulationData.error_injected ? 'ACTIVE' : 'OFF'}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher & Playback Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Mode Switcher Toggle */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setMode('AUTO');
                setIsPlaying(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'AUTO'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto Flow</span>
            </button>

            <button
              onClick={() => {
                setMode('STEP_BY_STEP');
                setIsPlaying(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'STEP_BY_STEP'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learning Mode</span>
            </button>
          </div>

          {/* Playback or Step Controls */}
          {mode === 'AUTO' ? (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setCurrentStepIdx(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Restart simulation from Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyan-300" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((prev) => Math.min(prev + 1, totalSteps - 1));
                }}
                disabled={currentStepIdx >= totalSteps - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                title="Next step"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Speed Selector */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-300 px-2 py-1 focus:outline-none"
              >
                <option value={2000}>0.5x Slow</option>
                <option value={1400}>1.0x Normal</option>
                <option value={700}>2.0x Fast</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIdx === 0}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold disabled:opacity-30 hover:bg-slate-700 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Step</span>
              </button>

              <span className="text-xs font-mono text-cyan-300 px-2">
                {currentStepIdx + 1} / {totalSteps}
              </span>

              <button
                onClick={() => setCurrentStepIdx((prev) => Math.min(totalSteps - 1, prev + 1))}
                disabled={currentStepIdx >= totalSteps - 1}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold disabled:opacity-30 hover:bg-cyan-500/30 transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Report</span>
          </button>

          <button
            onClick={() => setShowPacketModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 text-xs font-semibold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect Packet</span>
          </button>

          <button
            onClick={onNewTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <span>New Transaction</span>
          </button>
        </div>

      </div>

      {/* Network Topology Visualizer */}
      <NetworkTopologyVisualizer
        activeNode={currentStep?.node || 'CLIENT'}
        hasError={simulationData.error_injected}
        status={isComplete ? (isRejected ? 'REJECTED' : 'ACCEPTED') : 'TRANSMITTING'}
        stepProgress={totalSteps > 1 ? currentStepIdx / (totalSteps - 1) : 0}
      />

      {/* Main Grid: Pipeline Step Flowchart (Left) & Active Step Technical Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 18-Step Interactive Pipeline Flowchart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 glass-card flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              18-Stage Execution Workflow
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
              Step {currentStepIdx + 1} of {totalSteps}
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {steps.map((step, idx) => {
              const StepIcon = getStageIcon(step.stage);
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isErr = step.status === 'ERROR';

              return (
                <div
                  key={step.step_number}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(idx);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                      : isErr
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : isPast
                      ? 'bg-slate-900/40 border-slate-800 text-slate-300 opacity-85 hover:opacity-100'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : isErr
                          ? 'bg-rose-500 text-white font-bold'
                          : isPast
                          ? 'bg-slate-800 text-cyan-400'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono">
                          {step.step_number}. {step.stage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {step.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">{step.node}</span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ml-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Deep-Dive Technical Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Stage Card */}
          {currentStep && (
            <div className={`rounded-2xl border p-5 glass-card shadow-xl transition-all ${
              currentStep.status === 'ERROR'
                ? 'border-rose-500/50 bg-rose-950/20'
                : 'border-slate-800 bg-slate-950/90'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${
                    currentStep.status === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {React.createElement(getStageIcon(currentStep.stage), { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-100">{currentStep.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Stage: <span className="text-cyan-300">{currentStep.stage}</span> • Node: <span className="text-purple-300">{currentStep.node}</span>
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  currentStep.status === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : currentStep.status === 'ERROR'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {currentStep.status}
                </span>
              </div>

              {/* Summary Description */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed mb-3">
                {currentStep.summary}
              </div>

              {/* Educational Explanation Banner */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200 font-sans mb-4 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[10px] text-cyan-400 block mb-0.5">Computer Networks Concept:</span>
                  {getStepEducationalExplanation(currentStep.stage)}
                </div>
              </div>

              {/* Dynamic Technical Renderers based on stage */}
              <div className="space-y-3">
                
                {/* 1. Enter Transaction / Plaintext Input */}
                {currentStep.stage === 'ENTER_TRANSACTION' && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2">
                    <span className="text-[10px] text-slate-400 font-sans block">Raw Transaction JSON Data:</span>
                    <pre className="text-cyan-300 p-2.5 rounded-lg bg-slate-950 overflow-x-auto text-[11px] leading-relaxed">
                      {currentStep.technical_details.raw_json}
                    </pre>
                  </div>
                )}

                {/* 2. AES Encryption stage details */}
                {currentStep.stage === 'AES_ENCRYPTION' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">Algorithm</span>
                        <span className="text-cyan-300 font-bold">AES-256-GCM</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">Key Size</span>
                        <span className="text-blue-300 font-bold">256 bits (32B)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">Nonce Size</span>
                        <span className="text-purple-300 font-bold">96 bits (12B)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">Auth Tag</span>
                        <span className="text-emerald-300 font-bold">128 bits (16B)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between"><span className="text-slate-400">Fresh Nonce (Hex):</span><span className="text-purple-300 font-bold">{currentStep.technical_details.nonce_hex}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Authentication Tag (Hex):</span><span className="text-emerald-300 font-bold">{currentStep.technical_details.tag_hex}</span></div>
                    </div>

                    <HexBinaryViewer
                      title="Ciphertext + Auth Tag Payload"
                      hexData={currentStep.technical_details.ciphertext_hex || ''}
                    />
                  </div>
                )}

                {/* 3. Framing stage details */}
                {currentStep.stage === 'SELECT_FRAMING' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Method:</span>
                        <span className="text-purple-300 font-bold">{currentStep.technical_details.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stuffed Characters/Bits:</span>
                        <span className="text-cyan-300 font-bold">{currentStep.technical_details.stuffed_count}</span>
                      </div>
                    </div>

                    <HexBinaryViewer
                      title="Framed Data Stream (Delimiters Attached)"
                      hexData={currentStep.technical_details.framed_hex || ''}
                    />
                  </div>
                )}

                {/* 4. CRC Engine stage details */}
                {currentStep.stage === 'CRC_ENGINE' && (
                  <CrcVisualizer
                    algorithm={currentStep.technical_details.algorithm}
                    algorithmName={currentStep.technical_details.algorithm_name}
                    polynomial={currentStep.technical_details.polynomial}
                    polyHex={currentStep.technical_details.poly_hex}
                    crcHex={currentStep.technical_details.crc_hex}
                    crcBin={currentStep.technical_details.crc_bin}
                    calculationTrace={currentStep.technical_details.calculation_trace}
                  />
                )}

                {/* 5. Error Injection stage details */}
                {currentStep.stage === 'ERROR_INJECTION' && (
                  <div className="space-y-3">
                    {currentStep.technical_details.error_injected ? (
                      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-3">
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Channel Noise Corruption Injected</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/30">
                            <span className="text-[10px] text-slate-400 block font-sans">Target Bit Index:</span>
                            <span className="text-rose-300 font-bold">Bit #{currentStep.technical_details.target_bit_index}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/30">
                            <span className="text-[10px] text-slate-400 block font-sans">Byte Value Flip:</span>
                            <span className="text-rose-300 font-bold">{currentStep.technical_details.original_byte_hex} → {currentStep.technical_details.corrupted_byte_hex}</span>
                          </div>
                        </div>
                        <HexBinaryViewer
                          title="Corrupted Frame Payload"
                          hexData={currentStep.technical_details.corrupted_hex_sample || ''}
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <h5 className="font-bold text-emerald-300 text-xs">Clean Channel (SNR &gt; 35 dB)</h5>
                          <p className="text-xs text-slate-400">Zero transmission bit flips occurred.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. CRC Verification stage */}
                {currentStep.stage === 'CRC_VERIFICATION' && (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    currentStep.technical_details.status === 'PASS'
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/40 border-rose-500/50'
                  }`}>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-400">Transmitted CRC:</span>
                      <span className="text-cyan-300 font-bold">{currentStep.technical_details.transmitted_crc}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-400">Recalculated CRC at Receiver:</span>
                      <span className={`font-bold ${
                        currentStep.technical_details.status === 'PASS' ? 'text-emerald-300' : 'text-rose-400'
                      }`}>
                        {currentStep.technical_details.recalculated_crc}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-xs font-bold text-center">
                      {currentStep.technical_details.result}
                    </div>
                  </div>
                )}

                {/* 7. Bank Server Final Settlement stage */}
                {currentStep.stage === 'BANK_SERVER_VERIFIED' && (
                  <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>TRANSACTION VERIFIED & SETTLED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Sender Account</span>
                        <span className="text-slate-200 font-bold">{currentStep.technical_details.sender}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Receiver Account</span>
                        <span className="text-slate-200 font-bold">{currentStep.technical_details.receiver}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Verified Amount</span>
                        <span className="text-emerald-400 text-base font-bold">{currentStep.technical_details.amount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Status</span>
                        <span className="text-emerald-300 font-bold">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Transmission Failed stage */}
                {currentStep.stage === 'TRANSMISSION_FAILED' && (
                  <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <XCircle className="w-5 h-5" />
                      <span>TRANSMISSION FAILED</span>
                    </div>
                    <p className="text-xs text-rose-200 font-mono">
                      Reason: <span className="font-bold">{currentStep.technical_details.reason}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      The Bank Server halted pipeline execution before decryption to guarantee financial data integrity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Embedded Real-Time Activity Log */}
          <div className="h-[280px]">
            <LiveEventLog logs={simulationData.logs || []} title="Transmission Event Stream" />
          </div>

        </div>

      </div>

      {/* Packet Inspection Modal */}
      {showPacketModal && (
        <PacketDetailModal
          packet={simulationData.packet_summary}
          onClose={() => setShowPacketModal(false)}
        />
      )}

      {/* Audit Report Modal */}
      {showReportModal && (
        <TransmissionReportModal
          simulation={simulationData}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
};
