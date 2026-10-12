import React from 'react';
import { User, Laptop, Radio, Shield, Globe, Landmark, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NetworkTopologyVisualizerProps {
  activeNode: string; // 'CUSTOMER' | 'CLIENT' | 'ROUTER' | 'FIREWALL' | 'INTERNET' | 'BANK_SERVER' | ''
  hasError?: boolean;
  status?: 'IDLE' | 'TRANSMITTING' | 'ACCEPTED' | 'REJECTED';
  stepProgress?: number; // 0 to 1
  onSelectNode?: (nodeId: string) => void;
}

export const NetworkTopologyVisualizer: React.FC<NetworkTopologyVisualizerProps> = ({
  activeNode,
  hasError = false,
  status = 'IDLE',
  stepProgress = 0,
  onSelectNode,
}) => {
  const nodes = [
    {
      id: 'CUSTOMER',
      label: 'CUSTOMER',
      subtext: 'Initiation',
      detail: 'Form Input',
      icon: User,
      color: 'cyan',
    },
    {
      id: 'CLIENT',
      label: 'CLIENT',
      subtext: 'Enc & Frame & CRC',
      detail: 'AES + Stuffing',
      icon: Laptop,
      color: 'blue',
    },
    {
      id: 'ROUTER',
      label: 'ROUTER',
      subtext: 'Next-Hop Edge',
      detail: 'IP Forwarding',
      icon: Radio,
      color: 'indigo',
    },
    {
      id: 'FIREWALL',
      label: 'FIREWALL',
      subtext: 'Stateful Inspect',
      detail: 'Port 443 Policy',
      icon: Shield,
      color: 'purple',
    },
    {
      id: 'INTERNET',
      label: 'INTERNET',
      subtext: hasError ? '⚡ Noise Active' : 'WAN Channel',
      detail: hasError ? 'Bit Inverted' : 'Clean Fiber',
      icon: Globe,
      color: hasError ? 'rose' : 'cyan',
    },
    {
      id: 'BANK_SERVER',
      label: 'BANK SERVER',
      subtext: status === 'REJECTED' ? '✕ REJECTED' : '✓ Verified Settlement',
      detail: status === 'REJECTED' ? 'CRC Mismatch' : 'Auth Verified',
      icon: Landmark,
      color: status === 'REJECTED' ? 'rose' : 'emerald',
    },
  ];

  const getNodeIndex = (nodeId: string) => nodes.findIndex((n) => n.id === nodeId);
  const activeIdx = getNodeIndex(activeNode);

  // Calculate packet position in percentage across the pipeline
  const packetPercent = Math.max(0, Math.min(100, (stepProgress * 100)));

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 glass-card shadow-2xl relative overflow-hidden">
      {/* Background Cyber Grid & Radar Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      {hasError && (
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            Live Network Pathway & Packet Stream
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time physical & logical hop progression with active packet telemetry
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'TRANSMITTING' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 animate-pulse font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              PACKET IN FLIGHT ({Math.round(packetPercent)}%)
            </span>
          )}
          {status === 'ACCEPTED' && (
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-mono shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              TRANSMISSION VERIFIED (CRC PASS)
            </span>
          )}
          {status === 'REJECTED' && (
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 font-mono shadow-lg shadow-rose-950 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              PACKET REJECTED (CRC MISMATCH)
            </span>
          )}
        </div>
      </div>

      {/* Interactive Network Graph */}
      <div className="relative py-8 px-2">
        
        {/* Animated Laser Backbone Connection */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 -translate-y-7 bg-slate-900 rounded-full overflow-hidden border border-slate-800 -z-0">
          {/* Base inactive wire */}
          <div className="w-full h-full bg-slate-800/80" />

          {/* Active laser progress */}
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
              hasError && activeIdx >= 4
                ? 'bg-gradient-to-r from-cyan-400 via-rose-500 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,1)]'
                : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,1)]'
            }`}
            style={{
              width: activeIdx >= 0 ? `${(activeIdx / (nodes.length - 1)) * 100}%` : '0%',
            }}
          />
        </div>

        {/* Flying Animated Packet Indicator */}
        <div
          className="hidden md:flex absolute top-1/2 -translate-y-12 transition-all duration-500 ease-out z-20 pointer-events-none items-center flex-col"
          style={{
            left: `calc(32px + ${activeIdx >= 0 ? (activeIdx / (nodes.length - 1)) * 88 : 0}%)`,
          }}
        >
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider mb-1 shadow-lg ${
            hasError && activeIdx >= 4
              ? 'bg-rose-600 text-white shadow-rose-600/50 animate-bounce'
              : 'bg-cyan-500 text-slate-950 shadow-cyan-500/50'
          }`}>
            {hasError && activeIdx >= 4 ? '⚡ CORRUPTED PKT' : '📦 SECURE PKT'}
          </div>
          <div className={`w-3 h-3 rounded-full ${
            hasError && activeIdx >= 4
              ? 'bg-rose-400 animate-ping'
              : 'bg-cyan-400 animate-ping'
          }`} />
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 relative z-10">
          {nodes.map((n, idx) => {
            const Icon = n.icon;
            const isPassed = activeIdx >= idx && activeIdx !== -1;
            const isCurrent = activeNode === n.id;
            const isNodeError = hasError && n.id === 'INTERNET' && isPassed;
            const isRejectNode = status === 'REJECTED' && n.id === 'BANK_SERVER' && isPassed;

            return (
              <div
                key={n.id}
                onClick={() => onSelectNode?.(n.id)}
                className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900/95 border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-105 ring-2 ring-cyan-500/40'
                    : isNodeError || isRejectNode
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-lg shadow-rose-950'
                    : isPassed
                    ? 'bg-slate-900/90 border-cyan-500/40 text-slate-200'
                    : 'bg-slate-950/50 border-slate-850 text-slate-500 opacity-60 hover:opacity-90'
                }`}
              >
                {/* Node Icon Circle with Glowing Aura */}
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-2.5 transition-all shadow-lg relative ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-slate-950 shadow-cyan-500/50 animate-pulse-glow'
                      : isNodeError || isRejectNode
                      ? 'bg-rose-600 text-white shadow-rose-600/50'
                      : isPassed
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-cyan-950'
                      : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>

                {/* Node Labels */}
                <span className="text-xs font-bold font-mono tracking-wider">{n.label}</span>
                <span className={`text-[10px] mt-0.5 ${isNodeError ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                  {n.subtext}
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                  {n.detail}
                </span>

                {/* Status Indicator */}
                {isCurrent && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>ACTIVE HOP</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
