import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NewTransaction } from './pages/NewTransaction';
import { TransmissionSimulator } from './pages/TransmissionSimulator';
import { PacketAnalyzer } from './pages/PacketAnalyzer';
import { AlgorithmDetails } from './pages/AlgorithmDetails';
import { SimulationHistory } from './pages/SimulationHistory';
import type { SimulationResult, TransactionInput, FramingMethod, CrcAlgorithm } from './types';
import { runSimulation } from './services/api';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStartSimulation = async (params: {
    transaction: TransactionInput;
    framing_method: FramingMethod;
    crc_algorithm: CrcAlgorithm;
    inject_error: boolean;
  }) => {
    try {
      setLoading(true);
      const res = await runSimulation(params);
      setSimulationData(res);
      setActiveTab('simulator');
      showNotification(
        res.final_status === 'SUCCESSFUL'
          ? 'Transaction transmission verified successfully!'
          : 'Transmission failed: CRC mismatch detected bit corruption!',
        res.final_status === 'SUCCESSFUL' ? 'success' : 'error'
      );
    } catch (err: any) {
      showNotification(err.message || 'Failed to execute transmission', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (injectError: boolean) => {
    const demoTransaction: TransactionInput = {
      sender_account: 'DEMO-10001',
      receiver_account: 'DEMO-20002',
      amount: 5000,
      transaction_type: 'Fund Transfer',
      description: 'College Fee Payment',
    };

    handleStartSimulation({
      transaction: demoTransaction,
      framing_method: 'CHARACTER_STUFFING',
      crc_algorithm: 'CRC_16',
      inject_error: injectError,
    });
  };

  const handleLoadSimulation = (sim: SimulationResult) => {
    setSimulationData(sim);
    setActiveTab('simulator');
    showNotification(`Loaded historical simulation ${sim.simulation_id}`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickDemo={handleQuickDemo}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-mono text-xs border ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {notification.type === 'info' && <Shield className="w-4 h-4 text-cyan-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex items-center justify-center py-24 space-x-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-cyan-400">Executing Cryptographic & Network Pipeline...</span>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard setActiveTab={setActiveTab} onQuickDemo={handleQuickDemo} />
            )}

            {activeTab === 'transaction' && (
              <NewTransaction onSubmit={handleStartSimulation} />
            )}

            {activeTab === 'simulator' && (
              <TransmissionSimulator
                simulationData={simulationData}
                onRestart={() => {
                  if (simulationData) {
                    handleStartSimulation({
                      transaction: {
                        sender_account: simulationData.original_transaction.sender_account,
                        receiver_account: simulationData.original_transaction.receiver_account,
                        amount: simulationData.original_transaction.amount,
                        transaction_type: simulationData.original_transaction.transaction_type,
                        description: simulationData.original_transaction.description,
                      },
                      framing_method: simulationData.framing_method,
                      crc_algorithm: simulationData.crc_algorithm,
                      inject_error: simulationData.error_injected,
                    });
                  }
                }}
                onNewTransaction={() => setActiveTab('transaction')}
                onToggleErrorDemo={handleQuickDemo}
              />
            )}

            {activeTab === 'packets' && <PacketAnalyzer />}

            {activeTab === 'algorithms' && <AlgorithmDetails />}

            {activeTab === 'history' && (
              <SimulationHistory onLoadSimulation={handleLoadSimulation} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-2">
          <div>
            SECURE ONLINE BANKING DATA TRANSMISSION SYSTEM • Computer Networks Educational Simulation
          </div>
          <div className="flex items-center gap-3">
            <span>AES-256-GCM</span>
            <span>•</span>
            <span>Character & Bit Stuffing</span>
            <span>•</span>
            <span>CRC-12 / 16 / CCITT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
