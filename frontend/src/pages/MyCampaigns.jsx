import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  ExternalLink,
  Play,
  Pause,
  Trash2,
  Grid,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { campaignAPI } from '../services/api';
import { StatusBadge } from '../components/Common/Badge';
import { useToast } from '../components/Common/Toast';

export const MyCampaigns = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCampaigns = async () => {
    try {
      const res = await campaignAPI.getCampaigns({
        search,
        status: statusFilter,
      });
      if (res.data?.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [search, statusFilter]);

  const handlePause = async (id) => {
    try {
      await campaignAPI.pauseCampaign(id);
      addToast('Campaign and pending pins paused.', 'info');
      fetchCampaigns();
    } catch (err) {
      addToast('Failed to pause campaign.', 'error');
    }
  };

  const handleResume = async (id) => {
    try {
      await campaignAPI.resumeCampaign(id);
      addToast('Campaign resumed. Pins rescheduled.', 'success');
      fetchCampaigns();
    } catch (err) {
      addToast('Failed to resume campaign.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign and all its generated pins?')) return;
    try {
      await campaignAPI.deleteCampaign(id);
      addToast('Campaign deleted successfully.', 'success');
      fetchCampaigns();
    } catch (err) {
      addToast('Failed to delete campaign.', 'error');
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'paused', label: 'Paused' },
    { id: 'generating', label: 'Generating' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Campaigns
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your autonomous Pinterest affiliate marketing campaigns.
          </p>
        </div>
        <button
          onClick={() => navigate('/create-campaign')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto scrollbar-thin">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Campaigns Grid / List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No campaigns found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Get started by creating your first automated affiliate marketing campaign.
          </p>
          <button
            onClick={() => navigate('/create-campaign')}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
          >
            Create Campaign Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const stats = camp.stats || {};
            const total = camp.totalPins || 10;
            const published = stats.publishedCount || 0;
            const scheduled = stats.scheduledCount || 0;
            const progressPct = total > 0 ? Math.round((published / total) * 100) : 0;

            return (
              <div
                key={camp._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">
                        {camp.productCategory || 'Affiliate Product'}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug break-words">
                        {camp.campaignName}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={camp.campaignStatus} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                    {camp.productName}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>Publishing Progress</span>
                      <span>{published} of {total} pins published ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Interval:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {camp.publishingInterval >= 60 ? `Every ${camp.publishingInterval / 60} hour(s)` : `Every ${camp.publishingInterval} mins`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Target Board:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">
                        {camp.selectedBoard?.name || 'Default Board'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/pins?campaignId=${camp._id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <span>View 10 Pins</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {camp.campaignStatus === 'paused' ? (
                      <button
                        onClick={() => handleResume(camp._id)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                        title="Resume campaign"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePause(camp._id)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                        title="Pause campaign"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(camp._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
