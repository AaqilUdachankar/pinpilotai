import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  FolderPlus,
  Layers,
  ShieldCheck,
  Key,
  Copy,
  Info
} from 'lucide-react';
import { pinterestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/Toast';

export const PinterestAccounts = () => {
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');
  const urlError = searchParams.get('error');

  const { pinterestAccount, refreshPinterestStatus } = useAuth();
  const { addToast } = useToast();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshingBoards, setRefreshingBoards] = useState(false);

  useEffect(() => {
    if (urlStatus === 'success') {
      addToast('Pinterest Business account successfully connected via OAuth 2.0!', 'success');
      refreshPinterestStatus();
    } else if (urlError) {
      addToast(`Pinterest connection notice: ${urlError}`, 'error', 6000);
    }
  }, [urlStatus, urlError]);

  const fetchBoards = async () => {
    if (!pinterestAccount?.isConnected) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await pinterestAPI.getBoards();
      if (res.data?.success) {
        setBoards(res.data.boards || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [pinterestAccount]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await pinterestAPI.getConnectUrl();
      if (res.data?.success && res.data.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Pinterest App credentials missing. Please configure Client ID in Settings.',
        'error',
        6000
      );
      setConnecting(false);
    }
  };

  const handleSetDefaultBoard = async (boardId) => {
    try {
      const res = await pinterestAPI.selectDefaultBoard(boardId);
      if (res.data?.success) {
        addToast('Default Pinterest publishing board updated!', 'success');
        refreshPinterestStatus();
      }
    } catch (err) {
      addToast('Failed to set default board', 'error');
    }
  };

  const handleRefreshBoards = async () => {
    setRefreshingBoards(true);
    try {
      const res = await pinterestAPI.getBoards();
      if (res.data?.success) {
        setBoards(res.data.boards || []);
        addToast('Pinterest boards synchronized from official API.', 'success');
      }
    } catch (err) {
      addToast('Failed to refresh boards', 'error');
    } finally {
      setRefreshingBoards(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Pinterest account?')) return;
    try {
      await pinterestAPI.disconnect();
      addToast('Pinterest account disconnected.', 'info');
      refreshPinterestStatus();
      setBoards([]);
    } catch (err) {
      addToast('Failed to disconnect account', 'error');
    }
  };

  const redirectUri = window.location.origin.includes('localhost')
    ? 'http://localhost:5000/api/pinterest/callback'
    : `${window.location.origin}/api/pinterest/callback`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Pinterest Business Account Integration
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Connect your official Pinterest Business account through OAuth 2.0 to automate affiliate pin publishing and board management.
        </p>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-pinterest flex items-center justify-center text-white shadow-lg shadow-rose-500/25 shrink-0">
              <span className="text-2xl sm:text-3xl font-black">P</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Official Pinterest API v5
                </h3>
                {pinterestAccount?.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authorized & Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" /> Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {pinterestAccount?.isConnected
                  ? `Connected as @${pinterestAccount.username || 'business_user'} (${pinterestAccount.accountType || 'BUSINESS'})`
                  : 'Authorize PinPilot to publish pins directly with your affiliate destination link.'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {pinterestAccount?.isConnected ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRefreshBoards}
                  disabled={refreshingBoards}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingBoards ? 'animate-spin' : ''}`} />
                  Sync Boards
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-pinterest hover:bg-pinterest-dark text-white font-extrabold text-sm shadow-lg shadow-rose-500/25 transition active:scale-95 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>{connecting ? 'Connecting...' : 'Connect Pinterest Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Account Details & Permissions */}
        {pinterestAccount?.isConnected && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pinterest Username
              </span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block">
                @{pinterestAccount.username || 'unknown'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Token Security
              </span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> AES-256 Encrypted at Rest
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official API Permissions
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1 block truncate">
                boards:read, boards:write, pins:write
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Boards Section */}
      {pinterestAccount?.isConnected && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Connected Pinterest Boards ({boards.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your default board for affiliate campaigns or assign individual boards during campaign creation.
              </p>
            </div>
            <button
              onClick={handleRefreshBoards}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading boards...</div>
          ) : boards.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <FolderPlus className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No Pinterest boards detected
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Create a board on Pinterest (e.g. "Best Tech Finds" or "Home Aesthetics"), then click Refresh.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {boards.map((b) => {
                const isDefault = pinterestAccount.defaultBoardId === b.id;
                return (
                  <div
                    key={b.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                        📌
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {b.name}
                          </h4>
                          {isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                              Default Board
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {b.pinCount || 0} pins • {b.privacy || 'PUBLIC'}
                        </p>
                      </div>
                    </div>

                    {!isDefault && (
                      <button
                        onClick={() => handleSetDefaultBoard(b.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Setup Guide for Pinterest Developer App */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-indigo-500" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Pinterest App Setup & OAuth Configuration
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          To connect your account, make sure you have created an app in the official{' '}
          <a
            href="https://developers.pinterest.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-600 dark:text-rose-400 font-bold hover:underline inline-flex items-center gap-0.5"
          >
            Pinterest Developer Portal <ExternalLink className="w-3 h-3" />
          </a>{' '}
          and entered your Client ID & Secret in <span className="font-bold text-slate-700 dark:text-slate-200">Settings</span>.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300">
              Required Redirect URI for your Pinterest App:
            </span>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <span>{redirectUri}</span>
              <button
                onClick={() => copyToClipboard(redirectUri)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Copy Redirect URI"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300">
              Required Scopes:
            </span>
            <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
              boards:read, boards:write, pins:read, pins:write, user_accounts:read
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
