import type { TransactionInput, FramingMethod, CrcAlgorithm, SimulationResult, DashboardStats } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to load dashboard stats');
  return res.json();
}

export async function runSimulation(params: {
  transaction: TransactionInput;
  framing_method: FramingMethod;
  crc_algorithm: CrcAlgorithm;
  inject_error: boolean;
  error_bit_position?: number;
}): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulations/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Simulation failed to execute');
  }
  return res.json();
}

export async function fetchSimulations(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/simulations`);
  if (!res.ok) throw new Error('Failed to load simulations');
  return res.json();
}

export async function fetchSimulationDetail(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/simulations/${id}`);
  if (!res.ok) throw new Error('Failed to load simulation detail');
  return res.json();
}

export async function fetchPackets(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/packets`);
  if (!res.ok) throw new Error('Failed to load packets');
  return res.json();
}

export async function fetchPacketDetail(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/packets/${id}`);
  if (!res.ok) throw new Error('Failed to load packet detail');
  return res.json();
}

export async function fetchAlgorithmInfo(): Promise<any> {
  const res = await fetch(`${API_BASE}/algorithms/info`);
  if (!res.ok) throw new Error('Failed to load algorithm details');
  return res.json();
}

export async function calculateStandaloneCrc(data_hex: string, algorithm: string): Promise<any> {
  const res = await fetch(`${API_BASE}/algorithms/crc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data_hex, algorithm }),
  });
  if (!res.ok) throw new Error('CRC calculation failed');
  return res.json();
}

export async function encryptStandalone(transaction: any): Promise<any> {
  const res = await fetch(`${API_BASE}/algorithms/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction }),
  });
  if (!res.ok) throw new Error('Encryption failed');
  return res.json();
}
