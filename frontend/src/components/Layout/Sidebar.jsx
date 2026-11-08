import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Grid,
  Calendar,
  Share2,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, closeMobile }) => {
  const { user, pinterestAccount, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Create Campaign', path: '/create-campaign', icon: PlusCircle, highlight: true },
    { name: 'My Campaigns', path: '/campaigns', icon: FolderKanban },
    { name: 'Generated Pins', path: '/pins', icon: Grid },
    { name: 'Publishing Calendar', path: '/calendar', icon: Calendar },
    { name: 'Pinterest Accounts', path: '/pinterest-accounts', icon: Share2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Instructions & Guide', path: '/instructions', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pinterest flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <span className="font-extrabold text-xl tracking-tight leading-none">P</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">PinPilot</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Pinterest Automation</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : item.highlight
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
                {item.highlight && (
                  <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Pinterest Account Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pinterest Status
              </span>
              {pinterestAccount?.isConnected ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Connected
                </span>
              )}
            </div>
            {pinterestAccount?.isConnected ? (
              <div className="text-xs text-slate-700 dark:text-slate-200 truncate font-medium">
                @{pinterestAccount.username || 'business_account'}
              </div>
            ) : (
              <NavLink
                to="/pinterest-accounts"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 mt-1"
                onClick={closeMobile}
              >
                Connect Business API <ExternalLink className="w-3 h-3" />
              </NavLink>
            )}
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {user?.name || 'Affiliate Marketer'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
