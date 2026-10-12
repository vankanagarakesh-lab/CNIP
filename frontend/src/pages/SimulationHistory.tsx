import React, { useEffect, useState } from 'react';
import { History, Search, Play, CheckCircle2, XCircle } from 'lucide-react';
import { fetchSimulations, fetchSimulationDetail } from '../services/api';
import type { SimulationResult } from '../types';

interface SimulationHistoryProps {
  onLoadSimulation: (sim: SimulationResult) => void;
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({ onLoadSimulation }) => {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchSimulations();
      setSimulations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (simId: string) => {
    try {
      const detail = await fetchSimulationDetail(simId);
      onLoadSimulation({
        simulation_id: detail.simulation_id,
        transaction_id: detail.transaction_id,
        packet_id: detail.packet_id,
        framing_method: detail.framing_method,
        crc_algorithm: detail.crc_algorithm,
        error_injected: detail.error_injected,
        crc_verification_result: detail.crc_verification_result,
        final_status: detail.final_status,
        failure_reason: detail.failure_reason,
        original_transaction: detail.transaction || {},
        recovered_transaction: detail.final_status === 'SUCCESSFUL' ? detail.transaction : null,
        packet_summary: detail.packet || {},
        steps: detail.steps || [],
        logs: detail.logs || [],
        latency_ms: detail.latency_ms,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = simulations.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.simulation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.final_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5" />
            <span>SQLite Persistent Simulation Records</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Simulation History</h2>
          <p className="text-xs text-slate-400">
            Review past executions, examine error rates, and replay complete 18-step pipelines.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search TXN or SIM ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 glass-card shadow-xl overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Simulation ID</th>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Framing Method</th>
                <th className="p-3.5">CRC Algorithm</th>
                <th className="p-3.5">Noise Injected</th>
                <th className="p-3.5">CRC Result</th>
                <th className="p-3.5">Final Status</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-sans">
                    {loading ? 'Loading history...' : 'No simulation history found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.simulation_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-300">{s.simulation_id}</td>
                    <td className="p-3.5 text-slate-200">{s.transaction_id}</td>
                    <td className="p-3.5 text-purple-300">{s.framing_method}</td>
                    <td className="p-3.5 text-sky-400">{s.crc_algorithm}</td>
                    <td className="p-3.5 font-semibold">
                      {s.error_injected ? (
                        <span className="text-rose-400">YES (Active)</span>
                      ) : (
                        <span className="text-emerald-400">NO (Clean)</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={s.crc_verification_result === 'PASS' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {s.crc_verification_result}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.final_status === 'SUCCESSFUL'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {s.final_status === 'SUCCESSFUL' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{s.final_status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{s.latency_ms} ms</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleReplay(s.simulation_id)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Play className="w-3 h-3 fill-cyan-300" />
                        <span>Replay</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
