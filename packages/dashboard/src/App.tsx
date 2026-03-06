import { useEffect, useState } from 'react';
import { useDashboardStore } from './store.js';
import { Header } from './components/Header.js';
import { DashboardBody } from './components/DashboardBody.js';
import { SearchOverlay } from './components/SearchOverlay.js';

export function App() {
  const {
    sessions,
    milestones,
    health,
    loading,
    loadAll,
    loadHealth,
    deleteSession,
    deleteConversation,
    deleteMilestone,
    activeTab,
    setActiveTab,
  } = useDashboardStore();

  // Load data on mount
  useEffect(() => {
    loadAll();
    loadHealth();
  }, [loadAll, loadHealth]);

  // Auto-refresh every 30s
  useEffect(() => {
    const healthInterval = setInterval(loadHealth, 30_000);
    const dataInterval = setInterval(loadAll, 30_000);
    return () => {
      clearInterval(healthInterval);
      clearInterval(dataInterval);
    };
  }, [loadAll, loadHealth]);

  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base selection:bg-accent/30 selection:text-text-primary">
      <Header
        health={health}
        onSearchOpen={() => setSearchOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-6">
        <SearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          sessions={sessions}
          milestones={milestones}
          onDeleteSession={deleteSession}
          onDeleteConversation={deleteConversation}
          onDeleteMilestone={deleteMilestone}
        />

        <DashboardBody
          sessions={sessions}
          milestones={milestones}
          onDeleteSession={deleteSession}
          onDeleteConversation={deleteConversation}
          onDeleteMilestone={deleteMilestone}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
