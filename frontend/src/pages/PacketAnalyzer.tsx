import React, { useEffect, useState } from 'react';
import { Layers, Search, CheckCircle2, XCircle } from 'lucide-react';
import { fetchPackets, fetchPacketDetail } from '../services/api';
import { PacketDetailModal } from '../components/PacketDetailModal';

export const PacketAnalyzer: React.FC = () => {
  const [packets, setPackets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPacket, setSelectedPacket] = useState<any | null>(null);

  useEffect(() => {
    loadPackets();
  }, []);

  const loadPackets = async () => {
    try {
      setLoading(true);
      const data = await fetchPackets();
      setPackets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (packetId: string) => {
    try {
      const detail = await fetchPacketDetail(packetId);
      setSelectedPacket(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPackets = packets.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.packet_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      p.transmission_status === statusFilter ||
      (statusFilter === 'CORRUPTED' && p.error_injected);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Deep Frame & Header Inspector</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Packet Analyzer</h2>
          <p className="text-xs text-slate-400">
            Inspect headers, encrypted payloads, byte/bit framing boundaries, and CRC checksums.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Packet or TXN..."
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
            <option value="ALL">All Status</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CORRUPTED">Corrupted (Noise)</option>
          </select>
        </div>
      </div>

      {/* Packets Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 glass-card shadow-xl overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Packet ID</th>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Source → Destination</th>
                <th className="p-3.5">Framing Method</th>
                <th className="p-3.5">CRC Algorithm</th>
                <th className="p-3.5">CRC Value</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPackets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-sans">
                    {loading ? 'Loading packets...' : 'No packets match your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredPackets.map((pkt) => (
                  <tr key={pkt.packet_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-300">{pkt.packet_id}</td>
                    <td className="p-3.5 text-slate-300">{pkt.transaction_id}</td>
                    <td className="p-3.5 text-slate-400">
                      {pkt.source} → {pkt.destination}
                    </td>
                    <td className="p-3.5 text-purple-300 font-semibold">{pkt.framing_method}</td>
                    <td className="p-3.5 text-sky-400">{pkt.crc_algorithm}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">0x{pkt.crc_value_hex}</td>
                    <td className="p-3.5 text-slate-400">{pkt.packet_size_bytes} B</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          pkt.transmission_status === 'ACCEPTED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {pkt.transmission_status === 'ACCEPTED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{pkt.transmission_status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleInspect(pkt.packet_id)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Packet Modal */}
      {selectedPacket && (
        <PacketDetailModal
          packet={selectedPacket}
          onClose={() => setSelectedPacket(null)}
        />
      )}

    </div>
  );
};
