import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PipelineView from './components/PipelineView';
import ReadinessCalculator from './components/ReadinessCalculator';
import GrantMatcher from './components/GrantMatcher';
import PrintableReport from './components/PrintableReport';
import ClientDetailModal from './components/ClientDetailModal';
import NewClientModal from './components/NewClientModal';
import { INITIAL_CLIENTS } from './data/initialClients';
import { calculateReadiness } from './data/criteria';

export default function App() {
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('kia_clients_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_CLIENTS.length) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved clients:', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedClientForModal, setSelectedClientForModal] = useState(null);
  const [selectedClientForCalc, setSelectedClientForCalc] = useState(null);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kia_clients_v2', JSON.stringify(clients));
  }, [clients]);

  // Aggregate Metrics
  const totalClients = clients.length;
  const totalFees = clients.filter(c => c.commitmentFeePaid).length * 200;
  const avgScore = Math.round(
    clients.reduce((acc, c) => acc + calculateReadiness(c.scores).totalScore, 0) / (totalClients || 1)
  );

  // Handlers
  const handleUpdateStage = (clientId, newStage) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage: newStage } : c));
  };

  const handleSaveScores = (clientId, newScores) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const read = calculateReadiness(newScores);
        // Automatically check off readiness score assigned if score > 0
        const updatedChecklist = {
          ...c.checklist,
          initialAssessmentDone: true,
          regVerified: newScores.legal_reg >= 4,
          bizPlanDrafted: newScores.doc_plan >= 4,
          financialProjections: newScores.fin_projections >= 4
        };
        return {
          ...c,
          scores: newScores,
          checklist: updatedChecklist
        };
      }
      return c;
    }));
  };

  const handleSaveClient = (updatedClient) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleAddClient = (newClient) => {
    setClients(prev => [newClient, ...prev]);
    setSelectedClientForCalc(newClient);
    setActiveTab('calculator');
  };

  const handleUpdatePriorityGrants = (clientId, priorityList) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, priorityGrants: priorityList } : c));
  };

  const handleOpenCalculatorForClient = (client) => {
    setSelectedClientForCalc(client);
    setActiveTab('calculator');
  };

  const handleExportReportForClient = (client, scores) => {
    if (scores) {
      handleSaveScores(client.id, scores);
    }
    setSelectedClientForCalc(client);
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientCount={totalClients}
        avgScore={avgScore}
        totalFees={totalFees}
        onOpenNewClient={() => setIsNewClientOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pipeline' && (
          <PipelineView
            clients={clients}
            onSelectClient={(c) => setSelectedClientForModal(c)}
            onOpenCalculator={handleOpenCalculatorForClient}
            onOpenNewClient={() => setIsNewClientOpen(true)}
            onUpdateClientStage={handleUpdateStage}
          />
        )}

        {activeTab === 'calculator' && (
          <ReadinessCalculator
            clients={clients}
            selectedClient={selectedClientForCalc}
            onSaveScores={handleSaveScores}
            onExportReport={handleExportReportForClient}
          />
        )}

        {activeTab === 'matcher' && (
          <GrantMatcher
            clients={clients}
            onUpdatePriorityGrants={handleUpdatePriorityGrants}
          />
        )}

        {activeTab === 'reports' && (
          <PrintableReport
            clients={clients}
            selectedClient={selectedClientForCalc}
            onBack={() => setActiveTab('pipeline')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 KIA-START UP CONSULT • Grant Advisory & Readiness Practice • Confidential & Proprietary</p>
      </footer>

      {/* Modals */}
      {selectedClientForModal && (
        <ClientDetailModal
          client={selectedClientForModal}
          onClose={() => setSelectedClientForModal(null)}
          onSaveClient={handleSaveClient}
          onOpenCalculator={(c) => {
            setSelectedClientForModal(null);
            handleOpenCalculatorForClient(c);
          }}
        />
      )}

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onAddClient={handleAddClient}
      />
    </div>
  );
}
