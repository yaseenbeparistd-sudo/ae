'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores/app-store';
import {
  RefreshCw, Search, Bell, User, ChevronDown, Sun, Moon
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import type { TimeRange } from '@/types';
import { SearchField } from '@/components/ui/heroui-search-field';
import { Label } from '@heroui/react';



const ENVIRONMENTS = ['Dev', 'QA', 'UAT', 'Prod'];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const {
    sidebarExpanded, timeRange, setTimeRange,
    environment, setEnvironment, user,
    theme, toggleTheme
  } = useAppStore();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ov_theme') as 'light' | 'dark' | null;
    if (saved && (saved === 'light' || saved === 'dark')) {
      useAppStore.setState({ theme: saved });
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  // Extract current app from pathname (e.g. /applications/netra/logs -> netra)
  const appMatch = pathname ? pathname.match(/\/applications\/([^/]+)/) : null;
  const currentApp = appMatch ? appMatch[1] : 'all';

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'all') {
      router.push('/applications');
    } else {
      router.push(`/applications/${val}/health`);
    }
  };

  return (
    <header className={cn('ov-header', sidebarExpanded && 'sidebar-expanded')}>
      <div className="ov-header-left">
        {/* Application Selector */}
        <select 
          className="ov-header-app-selector" 
          value={currentApp} 
          onChange={handleAppChange}
          aria-label="Select Application"
        >
          <option value="all">All Applications</option>
          <option value="netra">Netra</option>
          <option value="kavacha">NextGen2</option>
          <option value="blackline">Blackline</option>
        </select>



        {/* Refresh */}
        <button className="ov-header-icon-btn" title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="ov-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        {!isSearchExpanded ? (
          <button 
            className="ov-header-icon-btn" 
            title="Search" 
            onClick={() => setIsSearchExpanded(true)}
          >
            <Search size={14} />
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 ease-out flex items-center">
            <SearchField name="search" className="relative group">
              <SearchField.Group className="flex items-center bg-[var(--ov-bg-card)] border border-[var(--ov-border)] rounded-[8px] px-3 py-1.5 focus-within:ring-2 focus-within:ring-[var(--ov-primary)] focus-within:border-[var(--ov-primary)] transition-all shadow-sm">
                <SearchField.SearchIcon className="text-[var(--ov-text-muted)] w-3.5 h-3.5 mr-2 opacity-70" />
                <SearchField.Input 
                  autoFocus 
                  className="w-[240px] bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[13px] text-[var(--ov-text-primary)] placeholder:text-[var(--ov-text-muted)] m-0 p-0 shadow-none" 
                  placeholder="Search applications, logs, or sessions..." 
                  onBlur={(e) => {
                    if (!e.target.value) setIsSearchExpanded(false);
                  }}
                  style={{ boxShadow: 'none' }}
                />
                <SearchField.ClearButton className="text-[var(--ov-text-muted)] hover:text-[var(--ov-text-primary)] w-3.5 h-3.5 ml-2 cursor-pointer outline-none" />
              </SearchField.Group>
            </SearchField>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle */}
          <button 
            className="ov-header-icon-btn" 
            title={mounted && theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"} 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {!mounted ? <Sun size={14} /> : theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Notifications */}
          <button 
            className="ov-header-icon-btn" 
            title="Alerts"
            onClick={() => alert("No new notifications")}
          >
            <Bell size={14} />
            <span className="ov-header-badge">2</span>
          </button>

          {/* User */}
          <div className="ov-header-user">
            <div className="ov-header-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
