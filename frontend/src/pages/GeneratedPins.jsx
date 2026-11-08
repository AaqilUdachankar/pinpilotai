import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Filter,
  Search,
  Sparkles,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { pinAPI, campaignAPI } from '../services/api';
import { PinCard } from '../components/Pin/PinCard';
import { PinEditModal } from '../components/Pin/PinEditModal';
import { RescheduleModal } from '../components/Pin/RescheduleModal';
import { useToast } from '../components/Common/Toast';

export const GeneratedPins = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignIdParam = searchParams.get('campaignId') || '';
  const statusParam = searchParams.get('status') || 'all';

  const { addToast } = useToast();

  const [pins, setPins] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignIdParam);

  // Modals state
  const [editingPin, setEditingPin] = useState(null);
  const [reschedulingPin, setReschedulingPin] = useState(null);

  const fetchPins = async () => {
    setLoading(true);
    try {
      const res = await pinAPI.getPins({
        campaignId: selectedCampaignId || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100,
      });
      if (res.data?.success) {
        setPins(res.data.pins);
      }
    } catch (err) {
      console.error('Failed to load pins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCampaignOptions = async () => {
      try {
        const res = await campaignAPI.getCampaigns({ limit: 100 });
        if (res.data?.success) {
          setCampaigns(res.data.campaigns);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCampaignOptions();
  }, []);

  useEffect(() => {
    fetchPins();
  }, [selectedCampaignId, statusFilter]);

  // Actions
  const handleEditSave = async (pinId, updatedData) => {
    try {
      const res = await pinAPI.updatePin(pinId, updatedData);
      if (res.data?.success) {
        addToast('Pin updated successfully!', 'success');
        fetchPins();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update pin', 'error');
    }
  };

  const handleRegenerateImage = async (pin) => {
    addToast(`Regenerating commercial 1000×1500 image for #${pin.conceptIndex}...`, 'info');
    try {
      const res = await pinAPI.regenerateImage(pin._id);
      if (res.data?.success) {
        addToast('New vertical commercial visual generated!', 'success');
        fetchPins();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to regenerate image', 'error');
    }
  };

  const handleRegenerateContent = async (pin) => {
    addToast(`Regenerating SEO copy for #${pin.conceptIndex}...`, 'info');
    try {
      const res = await pinAPI.regenerateContent(pin._id);
      if (res.data?.success) {
        addToast('SEO title and description regenerated!', 'success');
        fetchPins();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to regenerate content', 'error');
    }
  };

  const handlePublishNow = async (pin) => {
    addToast(`Publishing pin "${pin.title.substring(0, 30)}..." to Pinterest API v5...`, 'info');
    try {
      const res = await pinAPI.publishNow(pin._id);
      if (res.data?.success) {
        addToast('Pin published successfully to Pinterest!', 'success');
        fetchPins();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Pinterest publishing failed. Check error details.', 'error', 6000);
      fetchPins();
    }
  };

  const handleReschedule = async (pinId, newDate) => {
    try {
      const res = await pinAPI.reschedulePin(pinId, newDate);
      if (res.data?.success) {
        addToast('Publishing schedule updated!', 'success');
        fetchPins();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reschedule pin', 'error');
    }
  };

  const handleDelete = async (pin) => {
    if (!window.confirm(`Delete pin "${pin.title}"?`)) return;
    try {
      await pinAPI.deletePin(pin._id);
      addToast('Pin deleted.', 'info');
      fetchPins();
    } catch (err) {
      addToast('Failed to delete pin', 'error');
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Pins' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'published', label: 'Published' },
    { id: 'failed', label: 'Failed' },
    { id: 'paused', label: 'Paused' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Generated Pinterest Pins
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Preview, customize, and manage all 10 AI-generated vertical pins for your affiliate campaigns.
          </p>
        </div>

        {/* Campaign Selector Dropdown */}
        <div className="w-full sm:w-72">
          <select
            value={selectedCampaignId}
            onChange={(e) => {
              setSelectedCampaignId(e.target.value);
              setSearchParams(e.target.value ? { campaignId: e.target.value } : {});
            }}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.campaignName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto w-fit">
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

      {/* Pins Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading pins...</div>
      ) : pins.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Grid className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No pins found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Pins are created automatically when you launch an affiliate campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {pins.map((pin) => (
            <PinCard
              key={pin._id}
              pin={pin}
              onEdit={(p) => setEditingPin(p)}
              onRegenerateImage={handleRegenerateImage}
              onRegenerateContent={handleRegenerateContent}
              onPublishNow={handlePublishNow}
              onReschedule={(p) => setReschedulingPin(p)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Content Modal */}
      <PinEditModal
        isOpen={!!editingPin}
        onClose={() => setEditingPin(null)}
        pin={editingPin}
        onSave={handleEditSave}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!reschedulingPin}
        onClose={() => setReschedulingPin(null)}
        pin={reschedulingPin}
        onReschedule={handleReschedule}
      />
    </div>
  );
};
