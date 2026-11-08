import React, { useState, useEffect } from 'react';
import {
  Link2,
  Sparkles,
  Search,
  Calendar,
  Clock,
  Layers,
  Palette,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Edit3,
  DollarSign,
  Tag,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { campaignAPI, pinterestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/Toast';
import { ManualProductModal } from '../components/Campaign/ManualProductModal';
import { GenerationProgress } from '../components/Campaign/GenerationProgress';

export const CreateCampaign = () => {
  const { user, pinterestAccount } = useAuth();
  const { addToast } = useToast();

  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('');
  const [totalPins, setTotalPins] = useState(10);
  const [publishingInterval, setPublishingInterval] = useState(60); // minutes
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [imageStyle, setImageStyle] = useState('commercial-product-aesthetic');
  const [customInstructions, setCustomInstructions] = useState('');

  // Boards
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  // Generation state
  const [createdCampaign, setCreatedCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch connected Pinterest boards
  useEffect(() => {
    const fetchBoards = async () => {
      if (pinterestAccount?.isConnected) {
        setLoadingBoards(true);
        try {
          const res = await pinterestAPI.getBoards();
          if (res.data?.success && res.data.boards) {
            setBoards(res.data.boards);
            if (res.data.boards.length > 0) {
              const defaultBoard = res.data.boards.find((b) => b.id === pinterestAccount.defaultBoardId) || res.data.boards[0];
              setSelectedBoardId(defaultBoard.id);
            }
          }
        } catch (err) {
          console.error('Error fetching Pinterest boards:', err);
        } finally {
          setLoadingBoards(false);
        }
      }
    };
    fetchBoards();
  }, [pinterestAccount]);

  // Poll progress when campaign is generating
  useEffect(() => {
    let interval = null;
    if (createdCampaign && createdCampaign.campaignStatus === 'generating') {
      interval = setInterval(async () => {
        try {
          const res = await campaignAPI.getCampaignById(createdCampaign._id);
          if (res.data?.success) {
            setCreatedCampaign(res.data.campaign);
            if (res.data.campaign.campaignStatus !== 'generating') {
              clearInterval(interval);
              addToast('All 10 Pinterest pins generated and scheduled!', 'success');
            }
          }
        } catch (err) {
          console.error('Progress poll error:', err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [createdCampaign, addToast]);

  // Step 1: Scrape / Analyze URL
  const handleAnalyzeUrl = async (e) => {
    e?.preventDefault();
    if (!affiliateUrl) {
      addToast('Please paste a product or affiliate URL first.', 'warning');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await campaignAPI.analyzeUrl(affiliateUrl);
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setExtractedData(data);
        if (data.productName) {
          setCampaignName(`${data.productName} Campaign`);
          addToast(`Product identified: "${data.productName}"`, 'success');
        } else {
          addToast('Could not auto-detect product name. Please enter details manually.', 'warning');
          setShowManualModal(true);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error analyzing URL. You can enter details manually.', 'warning');
      setShowManualModal(true);
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Submit Campaign
  const handleGenerateCampaign = async (e) => {
    e.preventDefault();

    if (!affiliateUrl) {
      addToast('Affiliate URL is required.', 'error');
      return;
    }

    const productName = extractedData?.productName || campaignName;
    if (!productName) {
      addToast('Product name is required. Please analyze the URL or enter details manually.', 'warning');
      setShowManualModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const chosenBoard = boards.find((b) => b.id === selectedBoardId);

      const payload = {
        campaignName: campaignName || `${productName} Automation Campaign`,
        affiliateUrl,
        productName,
        productDescription: extractedData?.description || '',
        productCategory: extractedData?.category || 'General',
        brand: extractedData?.brand || '',
        features: extractedData?.features || [],
        price: extractedData?.price || '',
        totalPins: Number(totalPins) || 10,
        publishingInterval: Number(publishingInterval) || 60,
        startDate: new Date(startDate).toISOString(),
        selectedBoard: chosenBoard ? { id: chosenBoard.id, name: chosenBoard.name } : null,
        imageStyle,
        customInstructions,
        referenceImages: extractedData?.images || [],
      };

      const res = await campaignAPI.createCampaign(payload);
      if (res.data?.success) {
        setCreatedCampaign(res.data.campaign);
        addToast('Campaign generation started! 10 pins are being prepared in background.', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to start campaign generation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // If campaign is actively generating or completed, show the live progress screen
  if (createdCampaign) {
    return (
      <div className="py-6">
        <GenerationProgress campaign={createdCampaign} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Pinterest Affiliate Campaign
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Paste a single affiliate product URL. The system will extract product details, generate 10 unique vertical commercial designs, write SEO descriptions, and schedule them 24/7.
        </p>
      </div>

      {/* Main Affiliate Submission Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-rose-50/50 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
            Affiliate Product URL *
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://amazon.com/dp/... or https://brand.com/affiliate-link"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm shadow-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAnalyzeUrl}
              disabled={analyzing || !affiliateUrl}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md transition disabled:opacity-50 shrink-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing URL...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze Product</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Quick Test Links:</span>
            <button
              type="button"
              onClick={() => {
                setAffiliateUrl('https://example.com/affiliate/pro-wireless-noise-cancelling-headphones');
                setExtractedData({
                  productName: 'SonicPeak Pro Wireless Noise-Cancelling Headphones',
                  brand: 'SonicPeak',
                  category: 'Audio & Electronics',
                  price: '$179.99',
                  description: 'Premium over-ear wireless headphones with active noise cancellation, 45-hour battery life, and high-fidelity lossless audio.',
                  features: ['Hybrid Active Noise Cancelling (ANC)', '45-hour continuous battery playtime', 'Multipoint Bluetooth 5.3 connection', 'Memory foam ear cushions for all-day comfort'],
                  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&h=1500&fit=crop&q=80'],
                });
                setCampaignName('SonicPeak Headphones Affiliate Campaign');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
            >
              🎧 Audio Headphones
            </button>
            <button
              type="button"
              onClick={() => {
                setAffiliateUrl('https://example.com/affiliate/smart-ergonomic-standing-desk');
                setExtractedData({
                  productName: 'AeroLift Ergonomic Electric Standing Desk',
                  brand: 'AeroLift',
                  category: 'Home Office Furniture',
                  price: '$349.00',
                  description: 'Solid walnut dual-motor electric height-adjustable desk with built-in USB-C fast charging and anti-collision technology.',
                  features: ['Dual whisper-quiet electric motors', 'Solid walnut scratch-resistant top', '4 programmable memory presets', 'Integrated cable management tray'],
                  images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&h=1500&fit=crop&q=80'],
                });
                setCampaignName('AeroLift Standing Desk Campaign');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
            >
              🪑 Standing Desk
            </button>
          </div>
        </div>

        {/* Product Extraction Preview Card */}
        {extractedData && (
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {extractedData.images?.[0] ? (
                <img
                  src={extractedData.images[0]}
                  alt=""
                  className="w-16 h-20 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-16 h-20 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 font-bold text-lg shrink-0">
                  📌
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Product Extracted
                  </span>
                  {extractedData.brand && (
                    <span className="text-xs text-slate-400 font-semibold">{extractedData.brand}</span>
                  )}
                  {extractedData.price && (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                      {extractedData.price}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                  {extractedData.productName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-xl">
                  {extractedData.description || 'Extracted product details are ready to power AI pin generation.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" /> Modify Product Specs
            </button>
          </div>
        )}

        {/* Campaign Settings Form */}
        <form onSubmit={handleGenerateCampaign} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Ergonomic Gaming Mouse Campaign"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* Pinterest Board */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Pinterest Board
                </label>
                {!pinterestAccount?.isConnected && (
                  <span className="text-[11px] font-semibold text-amber-500">
                    Not connected yet
                  </span>
                )}
              </div>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {boards.length > 0 ? (
                  boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.pinCount || 0} pins)
                    </option>
                  ))
                ) : (
                  <option value="">
                    {pinterestAccount?.isConnected ? 'No boards found (create one on Pinterest)' : 'Default Affiliate Board (Connect Pinterest)'}
                  </option>
                )}
              </select>
            </div>

            {/* Total Pins */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Number of Pins (10 Unique Concepts)
              </label>
              <select
                value={totalPins}
                onChange={(e) => setTotalPins(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value={10}>10 Pins (Recommended – All 10 Creative Concepts)</option>
                <option value={5}>5 Pins (Top 5 Concepts)</option>
                <option value={15}>15 Pins (Extended Coverage)</option>
              </select>
            </div>

            {/* Publishing Interval */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Publishing Schedule Interval
              </label>
              <select
                value={publishingInterval}
                onChange={(e) => setPublishingInterval(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value={60}>Every 1 Hour (Standard Default)</option>
                <option value={30}>Every 30 Minutes (Fast rollout)</option>
                <option value={120}>Every 2 Hours (Spread over 20 hrs)</option>
                <option value={180}>Every 3 Hours</option>
                <option value={1440}>Once Daily (1 Pin / Day)</option>
              </select>
            </div>

            {/* Start Date & Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Publishing Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* AI Image Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                AI Image Creative Aesthetic
              </label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="commercial-product-aesthetic">Commercial Product Photography (Crisp Studio)</option>
                <option value="minimalist-vogue">Minimalist Scandinavian Luxury</option>
                <option value="lifestyle-organic">Realistic Lifestyle Living Room / Setup</option>
                <option value="vibrant-bold">Vibrant Pop High-Contrast Advertising</option>
              </select>
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Custom Marketing Instructions (Optional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Focus on battery life and student discounts; keep descriptions casual and enthusiastic."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>24/7 Persistent Agenda Queue. Closes & offline safe.</span>
            </div>

            <button
              type="submit"
              disabled={submitting || analyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-pinterest hover:bg-pinterest-dark text-white font-extrabold text-base shadow-xl shadow-rose-500/25 disabled:opacity-50 transition active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Campaign...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Campaign (10 Pins)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Manual Product Details Modal */}
      <ManualProductModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        initialData={extractedData}
        onConfirm={(data) => {
          setExtractedData(data);
          if (!campaignName) {
            setCampaignName(`${data.productName} Campaign`);
          }
          addToast('Product details updated successfully!', 'success');
        }}
      />
    </div>
  );
};
