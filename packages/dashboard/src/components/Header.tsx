import { Search } from 'lucide-react';
import { UseAILogo } from './UseAILogo.js';
import { TabBar } from './TabBar.js';
import { StatusBadge } from './StatusBadge.js';
import type { ActiveTab } from '../types.js';
import type { HealthInfo } from '../lib/types.js';

interface HeaderProps {
  health: HealthInfo | null;
  onSearchOpen?: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function Header({ health, onSearchOpen, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-border mb-6">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <UseAILogo className="h-6" />
          {health && health.active_sessions > 0 && (
            <StatusBadge
              label={`${health.active_sessions} active session${health.active_sessions !== 1 ? 's' : ''}`}
              color="success"
              dot
            />
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <TabBar activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        <div className="flex items-center gap-4">
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/50 bg-bg-surface-1 text-text-muted hover:text-text-primary hover:border-text-muted/50 transition-colors text-xs"
            >
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 rounded border border-border bg-bg-base text-[9px] font-mono leading-none">
                ⌘K
              </kbd>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
