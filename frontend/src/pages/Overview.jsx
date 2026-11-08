import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Grid,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  MousePointerClick,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  Share2,
  Calendar as CalendarIcon,
  Activity,
  ExternalLink
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Common/Badge';

export const Overview = () => {
  const navigate = useNavigate();
  const { pinterestAccount } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await analyticsAPI.getOverview();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data?.stats || {};
  const statusDistribution = data?.statusDistribution || [];
  const recentActivity = data?.recentActivity || [];
  const upcomingPins = data?.upcomingPins || [];

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns ?? 0,
      icon: Layers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      onClick: () => navigate('/campaigns'),
    },
    {
      title: 'Total Generated Pins',
      value: stats.totalPins ?? 0,
      icon: Grid,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      onClick: () => navigate('/pins'),
    },
    {
      title: 'Published Pins',
      value: stats.publishedPins ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      onClick: () => navigate('/pins?status=published'),
    },
    {
      title: 'Scheduled Pins',
      value: stats.scheduledPins ?? 0,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      onClick: () => navigate('/pins?status=scheduled'),
    },
    {
      title: 'Failed Pins',
      value: stats.failedPins ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      onClick: () => navigate('/pins?status=failed'),
    },
    {
      title: 'Pinterest Impressions',
      value: stats.metricsAvailable ? stats.totalImpressions.toLocaleString() : 'Pending API sync',
      subtitle: stats.metricsAvailable ? 'Tracked official impressions' : 'Awaiting Pinterest API data',
      icon: Eye,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      onClick: () => navigate('/analytics'),
    },
    {
      title: 'Outbound Clicks',
      value: stats.metricsAvailable ? stats.totalOutboundClicks.toLocaleString() : 'Pending API sync',
      subtitle: stats.metricsAvailable ? 'Affiliate link traffic' : 'Reflects real user clicks',
      icon: MousePointerClick,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      onClick: () => navigate('/analytics'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-rose-900/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Affiliate Automation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Turn Any Affiliate Link Into 10 Viral Pinterest Pins
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Paste your affiliate product URL, and PinPilot AI will scrape the product, design 10 vertical 1000×1500 commercial visuals, craft SEO copy, and automatically publish on an hourly schedule 24/7.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/create-campaign')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Create New Campaign
            </button>
            {!pinterestAccount?.isConnected && (
              <button
                onClick={() => navigate('/pinterest-accounts')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition"
              >
                <Share2 className="w-4 h-4" /> Connect Pinterest Business
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-rose-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className="group cursor-pointer bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </div>
                {card.subtitle && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Upcoming Schedule & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Publishing Queue (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Upcoming 24/7 Publishing Queue
                </h3>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                View Full Calendar <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingPins.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No scheduled pins in queue.</p>
                <button
                  onClick={() => navigate('/create-campaign')}
                  className="mt-3 text-xs font-bold text-rose-600 hover:underline"
                >
                  Create your first affiliate campaign
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingPins.map((pin) => (
                  <div key={pin._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={pin.imageUrl}
                        alt=""
                        className="w-10 h-14 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={pin.title}>
                          {pin.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{pin.campaignId?.campaignName || 'Campaign'}</span>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-rose-400 truncate max-w-[150px]">
                            {pin.campaignId?.selectedBoard?.name ? `Board: ${pin.campaignId.selectedBoard.name}` : 'Default Board'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {new Date(pin.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(pin.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Automated Cloud Background Worker Active
            </span>
            <span className="text-[11px] text-slate-400">Runs even when offline</span>
          </div>
        </div>

        {/* Status Distribution Pie Chart (1 Column) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Pins Status Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time delivery progress across all campaigns
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              {stats.totalPins === 0 ? (
                <div className="text-center text-xs text-slate-400">
                  No pins generated yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            {statusDistribution.map((item, i) => (
              <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  {item.name}
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent System Activity & Publishing Logs
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">Live Backend Audit Trail</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No activity logs recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivity.map((log) => {
              let dotColor = 'bg-blue-500';
              if (log.status === 'success') dotColor = 'bg-emerald-500';
              if (log.status === 'error') dotColor = 'bg-rose-500';
              if (log.status === 'warning') dotColor = 'bg-amber-500';

              return (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                      [{log.action}]
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {log.message}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-3">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
