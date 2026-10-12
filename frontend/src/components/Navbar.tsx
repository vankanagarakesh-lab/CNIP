import React from 'react';
import { Shield, Activity, Send, Cpu, Layers, History, Play, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickDemo: (injectError: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickDemo }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'transaction', label: 'New Transaction', icon: Send },
    { id: 'simulator', label: 'Transmission Simulator', icon: Shield },
    { id: 'packets', label: 'Packet Analyzer', icon: Layers },
    { id: 'algorithms', label: 'Algorithm Details', icon: Cpu },
    { id: 'history', label: 'Simulation History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Shield className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                SECURE ONLINE BANKING
              </span>
              <p className="text-[11px] text-cyan-400/70 font-mono tracking-wider">DATA TRANSMISSION SIMULATOR</p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Demo Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickDemo(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 transition-all text-xs font-medium shadow-sm shadow-emerald-950"
              title="Runs a complete 100% successful transmission with clean CRC verification"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>DEMO: NO ERROR</span>
            </button>
            <button
              onClick={() => onQuickDemo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-500/50 transition-all text-xs font-medium shadow-sm shadow-rose-950"
              title="Runs a transmission with active bit noise injection & CRC mismatch detection"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>DEMO: INJECT ERROR</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
