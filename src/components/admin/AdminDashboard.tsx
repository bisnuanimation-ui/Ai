import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  BarChart3,
  DollarSign,
  Sliders,
  Settings,
  Image as ImageIcon,
  Check,
  Star,
  RefreshCw,
  Layers,
  Upload,
  Globe,
  Search,
  FileText,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { AIModel, AspectRatio, PromptItem, AdCampaign } from '../../types';
import { generateAIPromptWithGemini } from '../../services/gemini';
import { compressImage } from '../../services/imageCompressor';
import { copyToClipboard } from '../../utils/clipboard';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFeatured,
    adSettings,
    updateAdSettings,
    adCampaigns,
    updateAdCampaigns,
    analytics,
    categories,
    resetAll,
    language,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'prompts' | 'ads' | 'analytics' | 'seo'>('prompts');
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Form states for new/edit prompt
  const [formTitle, setFormTitle] = useState('');
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formNegativePrompt, setFormNegativePrompt] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formModel, setFormModel] = useState<AIModel>('Midjourney v6');
  const [formCategory, setFormCategory] = useState('cyberpunk');
  const [formAspectRatio, setFormAspectRatio] = useState<AspectRatio>('4:3');
  const [formTags, setFormTags] = useState('AI, Midjourney, Art');
  const [formSeed, setFormSeed] = useState('84920194');
  const [formCfgScale, setFormCfgScale] = useState(7.0);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);

  // New Ad Campaign state
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campSponsor, setCampSponsor] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campImg, setCampImg] = useState('');
  const [campUrl, setCampUrl] = useState('');
  const [campBtn, setCampBtn] = useState('Learn More');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isAdminOpen || !isAdminLoggedIn) return null;

  const isBn = language === 'bn';

  // Handle local image file upload with instant compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingImage(true);
      try {
        const compressedDataUrl = await compressImage(file, 1280, 1280, 0.85);
        setFormImageUrl(compressedDataUrl);
        showToast(isBn ? '✓ ছবি অপটিমাইজ ও লোড সম্পন্ন হয়েছে!' : '✓ Image optimized & loaded successfully!');
      } catch (err) {
        console.error('Failed to compress image', err);
        showToast(isBn ? 'ছবি প্রসেস করতে ব্যর্থ হয়েছে' : 'Failed to process image file');
      } finally {
        setIsCompressingImage(false);
      }
    }
  };

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormTitleBn('');
    setFormPrompt('');
    setFormNegativePrompt('');
    setFormImageUrl('');
    setFormModel('Midjourney v6');
    setFormCategory('cyberpunk');
    setFormAspectRatio('4:3');
    setFormTags('AI, Cyberpunk, Art');
    setFormSeed(Math.floor(Math.random() * 90000000 + 10000000).toString());
    setFormCfgScale(7.0);
    setEditingPromptId(null);
    setIsAddingPrompt(true);
  };

  const handleOpenEdit = (p: PromptItem) => {
    setFormTitle(p.title);
    setFormTitleBn(p.titleBn || '');
    setFormPrompt(p.prompt);
    setFormNegativePrompt(p.negativePrompt || '');
    setFormImageUrl(p.imageUrl);
    setFormModel(p.model);
    setFormCategory(p.category);
    setFormAspectRatio(p.aspectRatio);
    setFormTags(p.tags ? p.tags.join(', ') : '');
    setFormSeed(p.seed || '');
    setFormCfgScale(p.cfgScale || 7.0);
    setEditingPromptId(p.id);
    setIsAddingPrompt(true);
  };

  const handleAiEnhancePrompt = async () => {
    if (!formPrompt.trim()) return;
    setIsAiEnhancing(true);
    try {
      const res = await generateAIPromptWithGemini(formPrompt, 'Cinematic Ultra Realistic');
      setFormPrompt(res.prompt);
      if (res.negativePrompt) setFormNegativePrompt(res.negativePrompt);
      if (!formTitle) setFormTitle(res.title);
      if (res.tags?.length) setFormTags(res.tags.join(', '));
      showToast(isBn ? '✓ জেমিনাই এআই দিয়ে প্রম্পট উন্নত করা হয়েছে!' : '✓ Prompt enhanced with Gemini AI!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiEnhancing(false);
    }
  };

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim()) return;

    setIsSubmittingPrompt(true);

    try {
      const tagsArray = formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      // Fallback image if none provided
      const imgUrl =
        formImageUrl.trim() ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

      if (editingPromptId) {
        const existing = prompts.find((p) => p.id === editingPromptId);
        if (existing) {
          const updatedItem: PromptItem = {
            ...existing,
            title: formTitle.trim() || 'AI Masterpiece',
            titleBn: formTitleBn.trim() || '',
            prompt: formPrompt.trim(),
            negativePrompt: formNegativePrompt.trim() || '',
            imageUrl: imgUrl,
            model: formModel,
            category: formCategory,
            aspectRatio: formAspectRatio,
            tags: tagsArray.length > 0 ? tagsArray : ['AI', 'Art'],
            seed: formSeed.trim() || '',
            cfgScale: Number(formCfgScale) || 7.0,
          };
          await updatePrompt(updatedItem);
        }
      } else {
        const newItemPayload = {
          title: formTitle.trim() || 'AI Masterpiece',
          titleBn: formTitleBn.trim() || '',
          prompt: formPrompt.trim(),
          negativePrompt: formNegativePrompt.trim() || '',
          imageUrl: imgUrl,
          model: formModel,
          category: formCategory,
          aspectRatio: formAspectRatio,
          tags: tagsArray.length > 0 ? tagsArray : ['AI', 'Art'],
          seed: formSeed.trim() || '',
          cfgScale: Number(formCfgScale) || 7.0,
          isFeatured: true,
        };
        await addPrompt(newItemPayload);
      }

      setIsAddingPrompt(false);
      setEditingPromptId(null);
    } catch (err) {
      console.error('Failed to submit prompt', err);
      showToast(isBn ? 'সংরক্ষণে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন' : 'Failed to save prompt');
    } finally {
      setIsSubmittingPrompt(false);
    }
  };

  // Add ad campaign
  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim() || !campSponsor.trim()) return;

    const newCamp: AdCampaign = {
      id: `camp-${Date.now()}`,
      title: campTitle,
      sponsorName: campSponsor,
      description: campDesc,
      imageUrl: campImg || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      targetUrl: campUrl || 'https://google.com',
      buttonText: campBtn || 'Learn More',
      badgeText: 'Verified Partner',
      active: true,
      cpmRate: 5.0,
      cpcRate: 0.4,
    };

    updateAdCampaigns([...adCampaigns, newCamp]);
    setIsAddingCampaign(false);
    setCampTitle('');
    setCampSponsor('');
    setCampDesc('');
    setCampImg('');
    setCampUrl('');
  };

  // Conversion rate USD to BDT
  const bdtRate = 122; // 1 USD ≈ 122 BDT
  const earningsBdt = Math.round(analytics.estimatedEarningsUsd * bdtRate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsAdminOpen(false)}
    >
      <div
        className="relative w-full max-w-5xl bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d131f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isBn ? 'এডমিন ড্যাশবোর্ড' : 'Admin Control Hub'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  {isBn ? 'সক্রিয়' : 'Authorized'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'প্রম্পট, ফটো আপলোড এবং কপি-অ্যাড মনিটাইজেশন নিয়ন্ত্রণ করুন'
                  : 'Manage prompts, artwork uploads, and copy-ad monetization wall'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAdminLoggedIn(false);
                setIsAdminOpen(false);
                showToast(isBn ? 'লগআউট সফল হয়েছে' : 'Logged out');
              }}
              className="px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 bg-rose-500/10 border border-rose-500/20 rounded-lg cursor-pointer"
            >
              {isBn ? 'লগআউট' : 'Logout'}
            </button>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('prompts');
              setIsAddingPrompt(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'prompts'
                ? 'border-amber-400 text-amber-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon size={15} />
            <span>{isBn ? 'প্রম্পট ও ফটো পরিচালনা' : 'Prompts & Photos'}</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-slate-700 rounded-full text-slate-300">
              {prompts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ads'
                ? 'border-amber-400 text-amber-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={15} />
            <span>{isBn ? 'অ্যাড ও কপি মনিটাইজেশন' : 'Ad & Copy Wall Settings'}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-amber-400 text-amber-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={15} />
            <span>{isBn ? 'বিজ্ঞাপন আয় ও পরিসংখ্যান' : 'Earnings & Analytics'}</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'seo'
                ? 'border-amber-400 text-amber-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={15} />
            <span>{isBn ? 'গুগল এসইও ও সার্চ কনসোল' : 'Google SEO & Search Console'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
              Active
            </span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              {!isAddingPrompt ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? 'আপনার ওয়েবসাইটের সকল AI প্রম্পট ও ছবি তালিকা। নতুন যোগ করুন অথবা এডিট করুন।'
                        : 'Manage all AI prompts and generated photos published on your site.'}
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer whitespace-nowrap"
                    >
                      <Plus size={15} />
                      <span>{isBn ? '+ নতুন প্রম্পট ও ছবি যোগ করুন' : '+ Add New AI Photo & Prompt'}</span>
                    </button>
                  </div>

                  {/* Prompts Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-3 w-16">{isBn ? 'ছবি' : 'Image'}</th>
                          <th className="p-3">{isBn ? 'শিরোনাম ও প্রম্পট' : 'Title & Prompt'}</th>
                          <th className="p-3">{isBn ? 'মডেল' : 'Model'}</th>
                          <th className="p-3 text-center">{isBn ? 'কপি সংখ্যা' : 'Copies'}</th>
                          <th className="p-3 text-center">{isBn ? 'ভিউ' : 'Views'}</th>
                          <th className="p-3 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {prompts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3">
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg bg-slate-800 border border-slate-700"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-white line-clamp-1">{p.title}</div>
                              <div className="text-slate-400 font-mono text-[11px] line-clamp-1 italic">
                                {p.prompt}
                              </div>
                            </td>
                            <td className="p-3 text-amber-300 font-medium whitespace-nowrap">
                              {p.model}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-200 tabular-nums">
                              {p.copyCount}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-400 tabular-nums">
                              {p.views}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => toggleFeatured(p.id)}
                                  className={`p-1.5 rounded-lg border cursor-pointer ${
                                    p.isFeatured
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                  title="Featured"
                                >
                                  <Star size={13} className={p.isFeatured ? 'fill-amber-400' : ''} />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>

                                {confirmDeleteId === p.id ? (
                                  <div className="flex items-center gap-1 bg-rose-950/80 p-0.5 rounded-lg border border-rose-500/40">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        deletePrompt(p.id);
                                        setConfirmDeleteId(null);
                                        showToast(isBn ? '✓ প্রম্পট মুছে ফেলা হয়েছে' : '✓ Prompt deleted');
                                      }}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded cursor-pointer transition-colors shadow-xs"
                                    >
                                      {isBn ? 'মুছুন' : 'Delete'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                                      title="Cancel"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 cursor-pointer transition-colors"
                                    title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Add / Edit Form */
                <form
                  onSubmit={handleSubmitPrompt}
                  className="space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      <span>
                        {editingPromptId
                          ? isBn
                            ? 'প্রম্পট সম্পাদনা করুন'
                            : 'Edit Prompt'
                          : isBn
                          ? 'নতুন AI ফটো ও প্রম্পট আপলোড'
                          : 'Upload New AI Photo & Prompt'}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingPrompt(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isBn ? 'ফটো নির্বাচন (আপনার কম্পিউটার/মোবাইল থেকে):' : 'Upload Image File:'}
                      </label>
                      <div className="flex items-center gap-3">
                        <label className={`flex items-center gap-2 px-4 py-2.5 ${isCompressingImage ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} text-xs font-medium rounded-xl border cursor-pointer transition-colors`}>
                          <Upload size={14} className={isCompressingImage ? 'animate-bounce text-amber-400' : 'text-amber-400'} />
                          <span>{isCompressingImage ? (isBn ? 'ইমেজ প্রসেসিং হচ্ছে...' : 'Optimizing Image...') : (isBn ? 'ফটো সিলেক্ট করুন' : 'Browse File...')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isCompressingImage}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {isBn ? 'অথবা নিচে ইমেজ লিঙ্ক দিন' : 'or enter image URL below'}
                        </span>
                      </div>
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://example.com/ai-art.jpg"
                        className="w-full mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>

                    {/* Image Preview Box */}
                    <div className="flex items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-800 min-h-[120px]">
                      {formImageUrl ? (
                        <div className="relative h-28 w-full max-w-xs rounded-lg overflow-hidden border border-slate-700">
                          <img
                            src={formImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="text-center text-slate-500 text-xs flex flex-col items-center">
                          <ImageIcon size={24} className="mb-1 text-slate-600" />
                          <span>{isBn ? 'ছবির প্রিভিউ এখানে দেখা যাবে' : 'Image preview here'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isBn ? 'শিরোনাম (English):' : 'Title (English):'}
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Cybernetic Golden Tiger"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isBn ? 'শিরোনাম (বাংলা - ঐচ্ছিক):' : 'Title (Bengali - Optional):'}
                      </label>
                      <input
                        type="text"
                        value={formTitleBn}
                        onChange={(e) => setFormTitleBn(e.target.value)}
                        placeholder="যেমন: সাইবারনেটিক গোল্ডেন টাইগার"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* AI Prompt Input + Gemini Enhance Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {isBn ? 'মূল এআই প্রম্পট (AI Prompt Text):' : 'Master AI Prompt:'}
                      </label>
                      <button
                        type="button"
                        onClick={handleAiEnhancePrompt}
                        disabled={isAiEnhancing || !formPrompt.trim()}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Sparkles size={12} className={isAiEnhancing ? 'animate-spin' : ''} />
                        <span>
                          {isAiEnhancing
                            ? isBn
                              ? 'এআই উন্নত করছে...'
                              : 'Enhancing...'
                            : isBn
                            ? '✨ জেমিনাই দিয়ে প্রম্পট উন্নত করুন'
                            : '✨ Enhance with Gemini'}
                        </span>
                      </button>
                    </div>
                    <textarea
                      value={formPrompt}
                      onChange={(e) => setFormPrompt(e.target.value)}
                      rows={4}
                      placeholder="e.g. Majestic mechanical tiger with glowing neon blue stripes walking in rain, photorealistic 8k --ar 4:3"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                      required
                    />
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isBn ? 'নেগেটিভ প্রম্পট (Negative Prompt):' : 'Negative Prompt:'}
                    </label>
                    <input
                      type="text"
                      value={formNegativePrompt}
                      onChange={(e) => setFormNegativePrompt(e.target.value)}
                      placeholder="blurry, low resolution, deformed limbs, watermark"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-rose-200/90 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  {/* Model, Category, Aspect Ratio Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        AI Model:
                      </label>
                      <select
                        value={formModel}
                        onChange={(e) => setFormModel(e.target.value as AIModel)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="Midjourney v6">Midjourney v6</option>
                        <option value="Flux.1 Schnell">Flux.1 Schnell</option>
                        <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                        <option value="DALL-E 3">DALL-E 3</option>
                        <option value="Google Imagen 3">Google Imagen 3</option>
                        <option value="Leonardo Phoenix">Leonardo Phoenix</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Category:
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white capitalize"
                      >
                        {categories
                          .filter((c) => c.id !== 'all')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {isBn ? c.nameBn : c.nameEn}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Aspect Ratio:
                      </label>
                      <select
                        value={formAspectRatio}
                        onChange={(e) => setFormAspectRatio(e.target.value as AspectRatio)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="4:3">4:3 (Landscape)</option>
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="9:16">9:16 (Story / Mobile)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Seed / CFG:
                      </label>
                      <input
                        type="text"
                        value={formSeed}
                        onChange={(e) => setFormSeed(e.target.value)}
                        placeholder="84920194"
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isBn ? 'ট্যাগ সমূহ (কমা দিয়ে আলাদা করুন):' : 'Tags (comma-separated):'}
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="Cyberpunk, Neon, 8K, Tiger"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    {editingPromptId ? (
                      <button
                        type="button"
                        onClick={() => {
                          deletePrompt(editingPromptId);
                          setIsAddingPrompt(false);
                          setEditingPromptId(null);
                          showToast(isBn ? '✓ প্রম্পটটি সফলভাবে মুছে ফেলা হয়েছে!' : '✓ Prompt deleted successfully!');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>{isBn ? 'এই প্রম্পটটি ডিলিট করুন' : 'Delete This Prompt'}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPrompt(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                      >
                        {isBn ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPrompt || isCompressingImage}
                        className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        {isSubmittingPrompt && <RefreshCw size={14} className="animate-spin" />}
                        <span>
                          {isSubmittingPrompt
                            ? isBn
                              ? 'পাবলিশ ও সেভ হচ্ছে...'
                              : 'Publishing...'
                            : editingPromptId
                            ? isBn
                              ? 'আপডেট সংরক্ষণ করুন'
                              : 'Save Changes'
                            : isBn
                            ? 'গ্যালারিতে পোস্ট করুন'
                            : 'Publish to Gallery'}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: AD MONETIZATION SETTINGS */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-400" />
                      <span>{isBn ? 'কপি-অ্যাড মনিটাইজেশন কন্ট্রোল' : 'Copy-Ad Monetization Wall'}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? 'ইউজার যখন প্রম্পট কপি বাটনে ক্লিক করবে তখন বিজ্ঞাপন দেখানোর নিয়ম'
                        : 'Controls the interstitial advertisement modal shown when a user clicks Copy Prompt'}
                    </p>
                  </div>

                  {/* Enable Ad Wall Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adSettings.adWallEnabled}
                      onChange={(e) =>
                        updateAdSettings({ ...adSettings, adWallEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                  {/* Countdown Timer */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isBn ? 'অ্যাড টাইমার / অপেক্ষা সময় (সেকেন্ড):' : 'Countdown Duration (Seconds):'}
                    </label>
                    <select
                      value={adSettings.countdownSeconds}
                      onChange={(e) =>
                        updateAdSettings({
                          ...adSettings,
                          countdownSeconds: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="0">{isBn ? '০ সেকেন্ড (তাৎক্ষণিক)' : '0s (Instant Unlock)'}</option>
                      <option value="3">3 Seconds</option>
                      <option value="4">4 Seconds (Recommended)</option>
                      <option value="5">5 Seconds</option>
                      <option value="7">7 Seconds</option>
                    </select>
                  </div>

                  {/* Active Campaign */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isBn ? 'সক্রিয় বিজ্ঞাপন ক্যাম্পেইন:' : 'Active Ad Campaign:'}
                    </label>
                    <select
                      value={adSettings.activeCampaignId}
                      onChange={(e) =>
                        updateAdSettings({ ...adSettings, activeCampaignId: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {adCampaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.sponsorName} - {c.title.slice(0, 30)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* In-feed banners toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isBn ? 'গ্যালারিতে ব্যানার বিজ্ঞাপন:' : 'In-Feed Gallery Banners:'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateAdSettings({
                          ...adSettings,
                          showInFeedBanners: !adSettings.showInFeedBanners,
                        })
                      }
                      className={`w-full p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        adSettings.showInFeedBanners
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {adSettings.showInFeedBanners
                        ? isBn
                          ? '✓ সক্রিয় (চালু আছে)'
                          : '✓ Enabled'
                        : isBn
                        ? 'বন্ধ আছে'
                        : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Google AdSense Publisher Config Block */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-amber-400 flex items-center justify-between">
                    <span>Google AdSense Publisher ID:</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Script Attached in &lt;head&gt;</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={adSettings.adsensePublisherId || 'ca-pub-9855677661793723'}
                      onChange={(e) =>
                        updateAdSettings({ ...adSettings, adsensePublisherId: e.target.value })
                      }
                      placeholder="ca-pub-9855677661793723"
                      className="flex-1 p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        showToast(isBn ? '✓ গুগল অ্যাডসেন্স আইডি আপডেট হয়েছে' : '✓ AdSense ID updated')
                      }
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {isBn ? 'সংরক্ষণ' : 'Save'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'আপনার প্রদত্ত পাজল ট্র্যাকিং স্ক্রিপ্ট (client=ca-pub-9855677661793723) সাইটের হেডার এবং কপি মোডালে অটোমেটিক রেন্ডার হচ্ছে।'
                      : 'Tracking script (client=ca-pub-9855677661793723) is automatically rendered in website <head> and ad interstitials.'}
                  </p>
                </div>
              </div>

              {/* Sponsor Campaigns List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    {isBn ? 'স্পন্সর ও বিজ্ঞাপনদাতাদের তালিকা' : 'Sponsor Campaigns & Ad Units'}
                  </h3>
                  <button
                    onClick={() => setIsAddingCampaign(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>{isBn ? '+ নতুন স্পন্সর ক্যাম্পেইন' : '+ New Campaign'}</span>
                  </button>
                </div>

                {isAddingCampaign && (
                  <form
                    onSubmit={handleAddCampaign}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          {isBn ? 'স্পন্সর ব্র্যান্ডের নাম:' : 'Sponsor Brand Name:'}
                        </label>
                        <input
                          type="text"
                          value={campSponsor}
                          onChange={(e) => setCampSponsor(e.target.value)}
                          placeholder="e.g. Nexus GPU Cloud"
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          {isBn ? 'বিজ্ঞাপনের মূল শিরোনাম:' : 'Ad Headline:'}
                        </label>
                        <input
                          type="text"
                          value={campTitle}
                          onChange={(e) => setCampTitle(e.target.value)}
                          placeholder="e.g. Rent H100 GPUs at 70% Off"
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        {isBn ? 'বিজ্ঞাপনের বিবরণ:' : 'Ad Description:'}
                      </label>
                      <textarea
                        value={campDesc}
                        onChange={(e) => setCampDesc(e.target.value)}
                        placeholder="Short description of the offer..."
                        rows={2}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Image URL:</label>
                        <input
                          type="url"
                          value={campImg}
                          onChange={(e) => setCampImg(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Target URL:</label>
                        <input
                          type="url"
                          value={campUrl}
                          onChange={(e) => setCampUrl(e.target.value)}
                          placeholder="https://sponsor.com"
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Button Text:</label>
                        <input
                          type="text"
                          value={campBtn}
                          onChange={(e) => setCampBtn(e.target.value)}
                          placeholder="Claim Offer"
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingCampaign(false)}
                        className="px-3 py-1.5 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                      >
                        Save Campaign
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">{c.sponsorName}</span>
                        {adSettings.activeCampaignId === c.id && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                            {isBn ? 'সক্রিয়' : 'Current Active'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-white">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{c.description}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>CPM: ${c.cpmRate} / 1k</span>
                        <span>CPC: ${c.cpcRate} / click</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVENUE & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">{isBn ? 'মোট প্রম্পট কপি' : 'Total Copies'}</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {analytics.totalCopies}
                  </div>
                  <span className="text-[11px] text-slate-500">{isBn ? 'ইউজার কর্তৃক সফল কপি' : 'Prompt copies'}</span>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">{isBn ? 'বিজ্ঞাপন ইম্প্রেশন' : 'Ad Impressions'}</span>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums">
                    {analytics.totalImpressions}
                  </div>
                  <span className="text-[11px] text-slate-500">{isBn ? 'অ্যাড দেখানো হয়েছে' : 'Ad views'}</span>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">{isBn ? 'বিজ্ঞাপনে ক্লিক' : 'Ad Clicks'}</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {analytics.totalClicks}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    CTR: {((analytics.totalClicks / Math.max(1, analytics.totalImpressions)) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-xs text-emerald-300 font-medium">
                    {isBn ? 'মোট আনুমানিক আয়' : 'Estimated Revenue'}
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    ${analytics.estimatedEarningsUsd.toFixed(2)}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 font-mono">
                    ≈ ৳{earningsBdt.toLocaleString()} BDT
                  </div>
                </div>
              </div>

              {/* Daily Performance Breakdown */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white">
                  {isBn ? 'দৈনিক পারফরম্যান্স ও আয় হিসেব' : 'Daily Ad Earnings & Copy Log'}
                </h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">{isBn ? 'তারিখ' : 'Date'}</th>
                        <th className="p-3 text-center">{isBn ? 'প্রম্পট কপি' : 'Copies'}</th>
                        <th className="p-3 text-center">{isBn ? 'ইম্প্রেশন' : 'Impressions'}</th>
                        <th className="p-3 text-center">{isBn ? 'ক্লিক' : 'Clicks'}</th>
                        <th className="p-3 text-right">{isBn ? 'উপার্জন (USD)' : 'Earnings'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {analytics.dailyStats.map((d) => (
                        <tr key={d.date} className="hover:bg-slate-900/40">
                          <td className="p-3 font-mono text-slate-300">{d.date}</td>
                          <td className="p-3 text-center font-mono tabular-nums text-amber-300">
                            {d.copies}
                          </td>
                          <td className="p-3 text-center font-mono tabular-nums text-slate-300">
                            {d.impressions}
                          </td>
                          <td className="p-3 text-center font-mono tabular-nums text-slate-300">
                            {d.clicks}
                          </td>
                          <td className="p-3 text-right font-mono font-bold tabular-nums text-emerald-400">
                            ${d.earnings.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reset System Option */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm(isBn ? 'সব ডেটা ডিফল্ট অবস্থায় ফিরিয়ে নেবেন?' : 'Reset all data to defaults?')) {
                      resetAll();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg border border-slate-700 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>{isBn ? 'ডিফল্ট ডেটায় রিসেট' : 'Reset Demo Data'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & GOOGLE SEARCH CONSOLE */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Google Search Console & Verification */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Search size={16} className="text-amber-400" />
                      <span>{isBn ? 'গুগল সার্চ কনসোল ও ইনডেক্সিং ভেরিফিকেশন' : 'Google Search Console & Indexing'}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? 'গুগল সার্চ রেজাল্টের প্রথম পেজে ওয়েবসাইটকে নিয়ে আসার জন্য মেটা ট্যাগ ও সাইটম্যাপ কনফিগারেশন'
                        : 'Configure Google site verification, XML sitemap, and rich metadata to rank on Google.'}
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={13} />
                    <span>{isBn ? 'এসইও প্রস্তুত' : 'SEO Ready'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                  {/* Google Verification Meta Tag */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-amber-400 flex items-center justify-between">
                      <span>Google Site Verification Code:</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Installed in &lt;head&gt;</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="ca-pub-9855677661793723"
                        className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white select-all"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await copyToClipboard('ca-pub-9855677661793723');
                          showToast(isBn ? '✓ ভেরিফিকেশন কোড কপি হয়েছে!' : '✓ Verification code copied!');
                        }}
                        className="px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <Copy size={13} />
                        <span>{isBn ? 'কপি' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'Search Console-এ "HTML tag" মেথড নির্বাচন করে এই কোডটি ভেরিফাই করতে পারবেন।'
                        : 'Use HTML tag verification method in Google Search Console.'}
                    </p>
                  </div>

                  {/* Sitemap.xml link */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-amber-400 flex items-center justify-between">
                      <span>Live Sitemap.xml URL:</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Live XML Endpoint</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml`}
                        className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 select-all"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const sitemapUrl = `${window.location.origin}/sitemap.xml`;
                          await copyToClipboard(sitemapUrl);
                          showToast(isBn ? '✓ সাইটম্যাপ লিঙ্ক কপি হয়েছে!' : '✓ Sitemap URL copied!');
                        }}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1"
                      >
                        <Copy size={13} />
                        <span>{isBn ? 'কপি' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'Search Console > Sitemaps সেকশনে গিয়ে sitemap.xml সাবমিট করুন।'
                        : 'Submit this sitemap URL under Google Search Console > Sitemaps.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Focus Keywords */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe size={16} className="text-amber-400" />
                  <span>{isBn ? 'প্রধান টার্গেটেড এসইও কিওয়ার্ডসমূহ' : 'Targeted SEO Focus Keywords'}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'NimeGami',
                    'AI Anime Prompts',
                    'Midjourney Anime Art',
                    'Niji 6 Prompts',
                    'অ্যানিমে প্রম্পট',
                    'Aditya TV Anime',
                    'ঠাকুরগাঁও ক্লথিং এআই',
                    'Stable Diffusion Anime',
                    'Free AI Prompt Gallery',
                    'Chainsaw Man AI Prompts',
                    'Naruto Style AI Prompts',
                    'Cyberpunk AI Prompts',
                  ].map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-amber-300 text-xs font-medium rounded-full flex items-center gap-1.5"
                    >
                      <span className="text-slate-500">#</span>
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Google Search Console Step-by-Step Instructions */}
              <div className="bg-gradient-to-br from-slate-900 to-[#141d2f] p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-amber-400" />
                  <span>{isBn ? 'গুগল সার্চে ওয়েবসাইট যুক্ত করার সহজ ৩টি ধাপ:' : '3 Easy Steps to Rank on Google:'}</span>
                </h3>
                <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">গুগল সার্চ কনসোলে যান:</strong>{' '}
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Google Search Console
                    </a>{' '}
                    ওপেন করে আপনার ওয়েবসাইটের URL প্রবেশ করান।
                  </li>
                  <li>
                    <strong className="text-white">অটো-ভেরিফিকেশন সম্পন্ন করুন:</strong> আপনার ওয়েবসাইটের হেডার কোডে ইতোমধ্যেই HTML ভেরিফিকেশন ট্যাগ এবং Google AdSense ট্র্যাকার যুক্ত রয়েছে।
                  </li>
                  <li>
                    <strong className="text-white">সাইটম্যাপ সাবমিট করুন:</strong> সার্চ কনসোলে বাম পাশের মেনু থেকে <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">Sitemaps</code> অপশনে গিয়ে <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">sitemap.xml</code> লিখে "Submit" বাটনে চাপুন।
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
