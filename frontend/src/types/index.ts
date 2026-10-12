export type FramingMethod = 'CHARACTER_FRAMING' | 'CHARACTER_STUFFING' | 'BIT_STUFFING';
export type CrcAlgorithm = 'CRC_12' | 'CRC_16' | 'CRC_CCITT';

export interface TransactionInput {
  sender_account: string;
  receiver_account: string;
  amount: number;
  transaction_type: string;
  description: string;
}

export interface SimulationStep {
  step_number: number;
  stage: string;
  title: string;
  node: 'CUSTOMER' | 'CLIENT' | 'ROUTER' | 'FIREWALL' | 'INTERNET' | 'BANK_SERVER';
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  timestamp: string;
  summary: string;
  technical_details: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  simulation_id?: string;
  stage?: string;
  node: string;
  event_type: 'INFO' | 'SECURITY' | 'ALERT' | 'SUCCESS' | 'ERROR';
  message: string;
  details?: Record<string, any>;
}

export interface PacketSummary {
  packet_id: string;
  transaction_id: string;
  source: string;
  destination: string;
  framing_method: FramingMethod;
  crc_algorithm: CrcAlgorithm;
  crc_value_hex: string;
  crc_value_bin: string;
  original_payload_hex: string;
  framed_payload_hex: string;
  corrupted_payload_hex?: string;
  corrupted_crc_hex?: string;
  packet_size_bytes: number;
  transmission_status: 'ACCEPTED' | 'REJECTED';
}

export interface SimulationResult {
  simulation_id: string;
  transaction_id: string;
  packet_id: string;
  framing_method: FramingMethod;
  crc_algorithm: CrcAlgorithm;
  error_injected: boolean;
  crc_verification_result: 'PASS' | 'FAIL' | 'N/A';
  final_status: 'SUCCESSFUL' | 'REJECTED';
  failure_reason?: string | null;
  original_transaction: Record<string, any>;
  recovered_transaction?: Record<string, any> | null;
  packet_summary: PacketSummary;
  steps: SimulationStep[];
  logs: LogEntry[];
  latency_ms?: number;
}

export interface DashboardStats {
  total_transactions: number;
  total_packets: number;
  successful_transmissions: number;
  rejected_transmissions: number;
  recent_simulations: Array<{
    simulation_id: string;
    transaction_id: string;
    packet_id: string;
    framing_method: string;
    crc_algorithm: string;
    error_injected: boolean;
    crc_verification_result: string;
    final_status: string;
    created_at: string;
  }>;
  recent_logs: LogEntry[];
}
