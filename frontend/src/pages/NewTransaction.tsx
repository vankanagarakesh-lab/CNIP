import React, { useState } from 'react';
import { Send, Shield, Zap, ArrowRight, Sparkles, Layers, Cpu } from 'lucide-react';
import type { FramingMethod, CrcAlgorithm, TransactionInput } from '../types';

interface NewTransactionProps {
  onSubmit: (params: {
    transaction: TransactionInput;
    framing_method: FramingMethod;
    crc_algorithm: CrcAlgorithm;
    inject_error: boolean;
  }) => void;
}

export const NewTransaction: React.FC<NewTransactionProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TransactionInput>({
    sender_account: 'DEMO-10001',
    receiver_account: 'DEMO-20002',
    amount: 5000,
    transaction_type: 'Fund Transfer',
    description: 'College Fee Payment',
  });

  const [framingMethod, setFramingMethod] = useState<FramingMethod>('CHARACTER_STUFFING');
  const [crcAlgorithm, setCrcAlgorithm] = useState<CrcAlgorithm>('CRC_16');
  const [injectError, setInjectError] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const presets = [
    {
      label: 'College Fee Payment',
      sender: 'DEMO-10001',
      receiver: 'DEMO-20002',
      amount: 5000,
      type: 'Fund Transfer',
      desc: 'College Fee Payment - Semester IV',
    },
    {
      label: 'Vendor Settlement',
      sender: 'DEMO-CORP-01',
      receiver: 'DEMO-SUPPLY-99',
      amount: 125000,
      type: 'Commercial Transfer',
      desc: 'Hardware Equipment Invoice #4092',
    },
    {
      label: 'Salary Credit',
      sender: 'DEMO-PAYROLL',
      receiver: 'DEMO-EMP-404',
      amount: 75000,
      type: 'Direct Deposit',
      desc: 'Monthly Salary Disbursement',
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setFormData({
      sender_account: p.sender,
      receiver_account: p.receiver,
      amount: p.amount,
      transaction_type: p.type,
      description: p.desc,
    });
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.sender_account.trim()) errs.sender_account = 'Sender Account is required';
    if (!formData.receiver_account.trim()) errs.receiver_account = 'Receiver Account is required';
    if (formData.sender_account.trim() === formData.receiver_account.trim()) {
      errs.receiver_account = 'Sender and Receiver cannot be identical';
    }
    if (!formData.amount || formData.amount <= 0) {
      errs.amount = 'Amount must be greater than zero';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      transaction: formData,
      framing_method: framingMethod,
      crc_algorithm: crcAlgorithm,
      inject_error: injectError,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fictional Banking Simulation Payload Builder</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">Enter Banking Transaction</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Configure transaction parameters and transmission options. The data will be validated, encrypted with AES-256-GCM, framed, checked with CRC, and transmitted.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-2">Quick Presets:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(p)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all font-mono"
          >
            {p.label} (₹{p.amount})
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Banking Transaction Fields */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 glass-card shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-sm uppercase tracking-wider">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>1. Transaction Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sender Account Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.sender_account}
                onChange={(e) => setFormData({ ...formData, sender_account: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g. DEMO-10001"
              />
              {errors.sender_account && <p className="text-rose-400 text-xs mt-1">{errors.sender_account}</p>}
            </div>

            {/* Receiver */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Receiver Account Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.receiver_account}
                onChange={(e) => setFormData({ ...formData, receiver_account: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g. DEMO-20002"
              />
              {errors.receiver_account && <p className="text-rose-400 text-xs mt-1">{errors.receiver_account}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount (INR / ₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="5000.00"
                />
              </div>
              {errors.amount && <p className="text-rose-400 text-xs mt-1">{errors.amount}</p>}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Type</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Fund Transfer">Fund Transfer</option>
                <option value="NEFT / RTGS">NEFT / RTGS</option>
                <option value="Commercial Transfer">Commercial Transfer</option>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="Bill Payment">Bill Payment</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Description / Remarks</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. College Fee Payment"
            />
          </div>
        </div>

        {/* Card 2: Framing Selection */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 glass-card shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-sm uppercase tracking-wider">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>2. Data Link Layer: Framing & Stuffing Method</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'CHARACTER_FRAMING',
                name: 'Character Framing',
                badge: 'Byte Count',
                desc: 'Encloses data in SOH + STX, 2-byte Length prefix, and ETX + EOT trailer.',
              },
              {
                id: 'CHARACTER_STUFFING',
                name: 'Character Stuffing',
                badge: 'Byte Stuffing',
                desc: 'DLE STX & DLE ETX framing with DLE byte escaping (DLE -> DLE DLE).',
              },
              {
                id: 'BIT_STUFFING',
                name: 'Bit Stuffing',
                badge: 'HDLC 01111110',
                desc: 'HDLC Flag byte with zero insertion after five consecutive 1s (11111 -> 111110).',
              },
            ].map((method) => {
              const isSelected = framingMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setFramingMethod(method.id as FramingMethod)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-100">{method.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {method.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{method.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: CRC Engine Selection */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 glass-card shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200 font-bold text-sm uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>3. Error Detection Engine: CRC Algorithm</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'CRC_12',
                name: 'CRC-12',
                poly: 'x¹² + x¹¹ + x³ + x² + x + 1',
                hex: '0x180F',
                desc: '12-bit remainder for character telecom streams.',
              },
              {
                id: 'CRC_16',
                name: 'CRC-16 (IBM)',
                poly: 'x¹⁶ + x¹⁵ + x² + 1',
                hex: '0x8005',
                desc: 'Standard 16-bit remainder used in USB, Modbus, Bisync.',
              },
              {
                id: 'CRC_CCITT',
                name: 'CRC-CCITT',
                poly: 'x¹⁶ + x¹² + x⁵ + 1',
                hex: '0x1021',
                desc: 'CCITT V.41 16-bit remainder used in HDLC & X.25.',
              },
            ].map((crc) => {
              const isSelected = crcAlgorithm === crc.id;
              return (
                <div
                  key={crc.id}
                  onClick={() => setCrcAlgorithm(crc.id as CrcAlgorithm)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-100">{crc.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {crc.hex}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-sky-400 mb-1">{crc.poly}</p>
                    <p className="text-xs text-slate-400">{crc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Channel Noise / Error Injection Control */}
        <div className={`rounded-2xl border p-6 glass-card shadow-xl transition-all ${
          injectError ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800 bg-slate-950/80'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${injectError ? 'text-rose-400' : 'text-amber-400'}`} />
                <h4 className="font-bold text-slate-100 text-sm">Channel Noise / Transmission Error Injection</h4>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                {injectError
                  ? 'Active bit corruption enabled. The simulator will invert specific bits in the transmitted frame, triggering a real CRC checksum mismatch at the Bank Server.'
                  : 'Clean channel. Packet will transmit without distortion and pass CRC verification.'}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono font-bold ${!injectError ? 'text-emerald-400' : 'text-slate-500'}`}>
                OFF (Clean)
              </span>

              <button
                type="button"
                onClick={() => setInjectError(!injectError)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  injectError ? 'bg-rose-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    injectError ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>

              <span className={`text-xs font-mono font-bold ${injectError ? 'text-rose-400' : 'text-slate-500'}`}>
                ON (Corrupt)
              </span>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base tracking-wide shadow-2xl shadow-cyan-500/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            <Shield className="w-5 h-5 text-slate-950" />
            <span>START SECURE TRANSMISSION</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>

      </form>

    </div>
  );
};
