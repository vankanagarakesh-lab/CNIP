import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, XCircle, Layers, Activity, Send, Play, AlertTriangle, Lock, Cpu, Globe, Database } from 'lucide-react';
import type { DashboardStats } from '../types';
import { fetchDashboardStats } from '../services/api';
import { NetworkTopologyVisualizer } from '../components/NetworkTopologyVisualizer';
import { LiveEventLog } from '../components/LiveEventLog';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onQuickDemo: (injectError: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onQuickDemo }) => {
  const [stats, setStats] = useState<DashboardStats>({
    total_transactions: 0,
    total_packets: 0,
    successful_transmissions: 0,
    rejected_transmissions: 0,
    recent_simulations: [],
    recent_logs: [],
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border border-cyan-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Computer Networks & Cybersecurity Lab</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Secure Online Banking Data Transmission System
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-300 font-medium">
            Computer Networks Security & Error Detection Simulation
          </p>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Experience real AES-256-GCM encryption, character/bit framing & stuffing, mathematical polynomial CRC engines, and channel noise injection with full packet trace inspection.
          </p>

          {/* Quick CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('transaction')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Initiate New Transaction</span>
            </button>

            <button
              onClick={() => onQuickDemo(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-emerald-400" />
              <span>Demo: No Error (Success)</span>
            </button>

            <button
              onClick={() => onQuickDemo(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Demo: Inject Error (CRC Fail)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Transactions */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1">{stats.total_transactions}</h3>
            <span className="text-[11px] text-cyan-400 font-mono">Fictional Banking Records</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Packets */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Packets</p>
            <h3 className="text-2xl font-bold text-slate-100 font-mono mt-1">{stats.total_packets}</h3>
            <span className="text-[11px] text-blue-400 font-mono">Framed Payloads</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Successful */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Successful</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.successful_transmissions}</h3>
            <span className="text-[11px] text-emerald-400/80 font-mono">CRC Verified & Decrypted</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card-hover flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Rejected</p>
            <h3 className="text-2xl font-bold text-rose-400 font-mono mt-1">{stats.rejected_transmissions}</h3>
            <span className="text-[11px] text-rose-400/80 font-mono">CRC Integrity Trip</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <NetworkTopologyVisualizer activeNode="CLIENT" status="IDLE" onSelectNode={() => setActiveTab('simulator')} />

      {/* Processing Pipeline Flowchart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 glass-card shadow-2xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Exact End-to-End Processing Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center font-mono text-xs">
          {[
            { name: '1. AES-256-GCM', desc: 'Encrypt + 128b Tag', icon: Lock, color: 'border-cyan-500/30 text-cyan-300' },
            { name: '2. FRAMING', desc: 'Char / Bit Stuffing', icon: Layers, color: 'border-blue-500/30 text-blue-300' },
            { name: '3. CRC ENGINE', desc: 'CRC-12/16/CCITT', icon: Cpu, color: 'border-indigo-500/30 text-indigo-300' },
            { name: '4. PACKET', desc: 'Header + Checksum', icon: Database, color: 'border-purple-500/30 text-purple-300' },
            { name: '5. TRANSMISSION', desc: 'Router → Firewall', icon: Globe, color: 'border-sky-500/30 text-sky-300' },
            { name: '6. CRC VERIFY', desc: 'Recalculate & Match', icon: CheckCircle2, color: 'border-emerald-500/30 text-emerald-300' },
            { name: '7. DECRYPTION', desc: 'Bank Verified', icon: Shield, color: 'border-teal-500/30 text-teal-300' },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className={`p-3 rounded-xl bg-slate-900/80 border ${step.color} flex flex-col items-center justify-center gap-1.5`}>
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="font-bold text-[11px]">{step.name}</span>
                <span className="text-[10px] text-slate-400 font-sans">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Simulations & Live Security Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Simulations */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 glass-card flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Recent Transmission Records
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px]">
            {stats.recent_simulations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No simulations executed yet. Click a demo button above!
              </div>
            ) : (
              stats.recent_simulations.map((s) => (
                <div
                  key={s.simulation_id}
                  onClick={() => setActiveTab('simulator')}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between font-mono text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{s.transaction_id}</span>
                      <span className="text-[10px] text-slate-400">({s.simulation_id})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      {s.framing_method} • {s.crc_algorithm} • Error: {s.error_injected ? 'YES' : 'NO'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      s.final_status === 'SUCCESSFUL'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {s.final_status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Security Activity Log */}
        <div className="h-[440px]">
          <LiveEventLog logs={stats.recent_logs} />
        </div>

      </div>

    </div>
  );
};
