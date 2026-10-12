import React, { useState } from 'react';
import { Terminal, Info, Search } from 'lucide-react';
import type { LogEntry } from '../types';

interface LiveEventLogProps {
  logs: LogEntry[];
  title?: string;
}

export const LiveEventLog: React.FC<LiveEventLogProps> = ({ logs, title = 'Real-Time Activity & Security Log' }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'ALL' || log.event_type === filter || log.node === filter;
    const matchesSearch =
      searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.node.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono">OK</span>;
      case 'ERROR':
        return <span className="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono">ERROR</span>;
      case 'ALERT':
        return <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono">ALERT</span>;
      case 'SECURITY':
        return <span className="text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono">SEC</span>;
      default:
        return <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono">INFO</span>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 shadow-2xl flex flex-col h-full font-mono text-xs overflow-hidden">
      {/* Log Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>{title}</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
            {logs.length} Events
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500/50 w-32 sm:w-40"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300 px-2 py-1 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Nodes</option>
            <option value="CUSTOMER">Customer</option>
            <option value="CLIENT">Client</option>
            <option value="ROUTER">Router</option>
            <option value="FIREWALL">Firewall</option>
            <option value="INTERNET">Internet</option>
            <option value="BANK_SERVER">Bank Server</option>
            <option value="ERROR">Errors Only</option>
          </select>
        </div>
      </div>

      {/* Log Stream Body */}
      <div className="p-3 space-y-1.5 overflow-y-auto max-h-[380px] flex-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Info className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p>No activity recorded yet for this filter</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/40 transition-colors"
            >
              <span className="text-slate-400 font-mono text-[11px] pt-0.5 shrink-0">
                {log.timestamp}
              </span>
              <div className="shrink-0">{getEventBadge(log.event_type)}</div>
              <span className="text-[11px] text-cyan-400/80 font-bold shrink-0">
                [{log.node}]
              </span>
              <span className="text-slate-300 text-[11px] flex-1 font-sans leading-relaxed">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
