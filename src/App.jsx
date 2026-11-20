import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoleSwitcherBar from './components/RoleSwitcherBar';
import CeoDashboardView from './components/CeoDashboardView';
import CrmCasesView from './components/CrmCasesView';
import TasksView from './components/TasksView';
import LegacyRecoveryView from './components/LegacyRecoveryView';
import ReadinessCalculator from './components/ReadinessCalculator';
import GrantMatcher from './components/GrantMatcher';
import PrintableReport from './components/PrintableReport';
import DocumentHubView from './components/DocumentHubView';
import ClientUploadPortal from './components/ClientUploadPortal';
import CaseDossierModal from './components/CaseDossierModal';
import NewClientIntakeModal from './components/NewClientIntakeModal';
import ApplicationPipelineView from './components/ApplicationPipelineView';
import GrantCatalogueView from './components/GrantCatalogueView';
import FinanceDeskView from './components/FinanceDeskView';
import AutomationControlView from './components/AutomationControlView';
import OperationalReportsView from './components/OperationalReportsView';
import TeamManagementModal from './components/TeamManagementModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

import { authService } from './services/authService';
import { crmService } from './services/crmService';
import { dashboardService } from './services/dashboardService';
import { documentService } from './services/documentService';
import { INITIAL_CLIENTS } from './data/initialClients';

export default function App() {
  const [staffUsers, setStaffUsers] = useState(() => authService.getAllStaffUsers());
  const [authScreen, setAuthScreen] = useState(() => {
    const savedId = sessionStorage.getItem('kia_auth_user_id');
    if (savedId) {
      const activeUser = authService.getActiveStaffUsers().find(u => u.id === savedId);
      if (activeUser) {
        authService.setCurrentUser(activeUser.id);
        return 'app';
      }
    }
    return 'landing';
  });
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [cases, setCases] = useState(() => crmService.getCases());
  const [activeTab, setActiveTab] = useState('ceo_dashboard');
  
  // Client upload token (from URL query string or simulation)
  const [clientUploadToken, setClientUploadToken] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') || null;
  });
  
  // Modals
  const [selectedCaseForDossier, setSelectedCaseForDossier] = useState(null);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (authScreen !== 'app') return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authScreen]);
  
  // Pipeline & legacy compatibility state
  const [legacyClients, setLegacyClients] = useState(() => {
    const saved = localStorage.getItem('kia_clients_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_CLIENTS.length) return parsed;
      } catch (e) {
        console.error('Failed to parse saved clients:', e);
      }
    }
    return INITIAL_CLIENTS;
  });
  const [selectedClientForCalc, setSelectedClientForCalc] = useState(null);

  // Sync legacy clients
  useEffect(() => {
    localStorage.setItem('kia_clients_v2', JSON.stringify(legacyClients));
  }, [legacyClients]);

  const refreshAllState = () => {
    setCases(crmService.getCases());
  };

  const handleLoginSuccess = async (staffUser) => {
    const updated = authService.setCurrentUser(staffUser.id);
    setCurrentUser(updated);
    sessionStorage.setItem('kia_auth_user_id', updated.id);
    setAuthScreen('app');
    setStaffUsers(authService.getAllStaffUsers());
    await Promise.all([
      crmService.syncCasesFromSupabase(),
      documentService.syncDocumentsFromSupabase()
    ]);
    setCases(crmService.getCases());
  };

  useEffect(() => {
    if (authScreen !== 'app') return;
    let cancelled = false;
    (async () => {
      await authService.syncStaffFromSupabase();
      await Promise.all([
        crmService.syncCasesFromSupabase(),
        documentService.syncDocumentsFromSupabase()
      ]);
      if (!cancelled) {
        const refreshedUser = authService.getCurrentUser();
        if (refreshedUser) setCurrentUser(refreshedUser);
        setStaffUsers(authService.getAllStaffUsers());
        setCases(crmService.getCases());
      }
    })();
    return () => { cancelled = true; };
  }, [authScreen]);

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    sessionStorage.removeItem('kia_auth_user_id');
    setAuthScreen('landing');
  };

  // Metrics
  const ceoMetrics = dashboardService.getCeoMetrics();
  const underReviewDocsCount = documentService.getCaseRequirements().filter(r => r.status === 'under_review' || r.status === 'uploaded').length;

  // Handlers for legacy/pipeline views
  const handleUpdateStage = (clientId, newStage) => {
    setLegacyClients(prev => prev.map(c => c.id === clientId ? { ...c, stage: newStage } : c));
  };

  const handleSaveScores = (clientId, newScores) => {
    setLegacyClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          scores: newScores,
          checklist: {
            ...c.checklist,
            initialAssessmentDone: true
          }
        };
      }
      return c;
    }));
  };

  const handleUpdatePriorityGrants = (clientId, priorityList) => {
    setLegacyClients(prev => prev.map(c => c.id === clientId ? { ...c, priorityGrants: priorityList } : c));
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

  const handleClientRegistered = (newCase) => {
    refreshAllState();
    setSelectedCaseForDossier(newCase);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* If viewing as a client via upload token link */}
      {clientUploadToken ? (
        <ClientUploadPortal
          token={clientUploadToken}
          onExitPortal={() => {
            setClientUploadToken(null);
            // clear search param if in URL
            if (window.location.search.includes('token=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
        />
      ) : authScreen === 'landing' ? (
        <LandingPage
          onGoToLogin={() => setAuthScreen('login')}
          onOpenClientToken={(token) => setClientUploadToken(token)}
        />
      ) : authScreen === 'login' || !currentUser ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToWelcome={() => setAuthScreen('landing')}
        />
      ) : (
        <>
          {/* Authenticated Staff Session Bar */}
          <RoleSwitcherBar
            currentUser={currentUser}
            onOpenTeamManagement={() => setIsTeamModalOpen(true)}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onSignOut={handleSignOut}
          />

          {/* Main Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            clientCount={cases.length}
            verifiedFees={ceoMetrics.verifiedFeesAmount}
            overdueTasksCount={ceoMetrics.overdueTasksCount}
            underReviewDocsCount={underReviewDocsCount}
            onOpenNewClient={() => setIsNewClientOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Main Workspace View Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* TAB 1: CEO Dashboard */}
            {activeTab === 'ceo_dashboard' && (
              <CeoDashboardView
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenNewClient={() => setIsNewClientOpen(true)}
                onOpenTeamManagement={() => setIsTeamModalOpen(true)}
              />
            )}

            {/* TAB 2: CRM Cases */}
            {activeTab === 'crm_cases' && (
              <CrmCasesView
                onSelectCase={(c) => setSelectedCaseForDossier(c)}
                onOpenNewClient={() => setIsNewClientOpen(true)}
              />
            )}

            {/* TAB 3: Documents Hub */}
            {activeTab === 'documents' && (
              <DocumentHubView
                onSelectCase={(c) => setSelectedCaseForDossier(c)}
                onOpenClientPortalSim={(tok) => setClientUploadToken(tok)}
              />
            )}

            {/* TAB 4: Tasks & Accountability */}
            {activeTab === 'tasks' && (
              <TasksView />
            )}

            {/* TAB 5: Applications Pipeline */}
            {activeTab === 'pipeline' && (
              <ApplicationPipelineView
                onOpenMatcher={() => setActiveTab('matcher')}
              />
            )}

            {/* TAB 6: Grant Catalogue */}
            {activeTab === 'grants' && (
              <GrantCatalogueView
                onAdoptOpportunity={() => setActiveTab('matcher')}
              />
            )}

            {/* TAB 7: Grant Matcher */}
            {activeTab === 'matcher' && (
              <GrantMatcher
                onApplicationAdopted={() => setActiveTab('pipeline')}
              />
            )}

            {/* TAB 8: Readiness Calculator */}
            {activeTab === 'calculator' && (
              <ReadinessCalculator
                clients={legacyClients}
                selectedClient={selectedClientForCalc}
                onSaveScores={handleSaveScores}
                onExportReport={handleExportReportForClient}
              />
            )}

            {/* TAB 9: Finance Desk */}
            {activeTab === 'finance' && (
              <FinanceDeskView />
            )}

            {/* TAB 10: Automation Radar */}
            {activeTab === 'automation' && (
              <AutomationControlView />
            )}

            {/* TAB 11: Operational Reports */}
            {activeTab === 'reports' && (
              selectedClientForCalc ? (
                <PrintableReport
                  clients={legacyClients}
                  selectedClient={selectedClientForCalc}
                  onBack={() => setSelectedClientForCalc(null)}
                />
              ) : (
                <OperationalReportsView />
              )
            )}

            {/* TAB 12: Legacy Client Recovery */}
            {activeTab === 'legacy_recovery' && (
              <LegacyRecoveryView
                onReconciledCase={refreshAllState}
              />
            )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 KIA-START UP CONSULT • Accra, Ghana • Grant Advisory & Readiness Practice • Confidential & Proprietary</p>
      </footer>

      {/* Modals */}
      {selectedCaseForDossier && (
        <CaseDossierModal
          initialCase={selectedCaseForDossier}
          onClose={() => setSelectedCaseForDossier(null)}
          onCaseUpdated={refreshAllState}
        />
      )}

      <NewClientIntakeModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onClientRegistered={handleClientRegistered}
      />

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={currentUser}
        onTeamUpdated={(updated) => setStaffUsers(updated)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={(c) => setSelectedCaseForDossier(c)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
        </>
      )}
    </div>
  );
}
