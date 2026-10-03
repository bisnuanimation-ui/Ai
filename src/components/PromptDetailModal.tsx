import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Heart, Sparkles, Sliders, Layers, Eye, Share2 } from 'lucide-react';

export const PromptDetailModal: React.FC = () => {
  const {
    activePromptDetail,
    setActivePromptDetail,
    handleRequestCopy,
    likedPromptIds,
    toggleLike,
    setIsStudioOpen,
    language,
    showToast,
  } = useApp();

  if (!activePromptDetail) return null;

  const isBn = language === 'bn';
  const isLiked = likedPromptIds.includes(activePromptDetail.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activePromptDetail.title,
        text: activePromptDetail.prompt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(isBn ? '✓ লিংক কপি করা হয়েছে' : '✓ Link copied');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setActivePromptDetail(null)}
    >
      <div
        className="relative w-full max-w-4xl bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={() => setActivePromptDetail(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Left: High Res Image View */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative overflow-hidden group">
          <img
            src={activePromptDetail.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
            alt={activePromptDetail.title}
            referrerPolicy="no-referrer"
            className="w-full h-full max-h-[50vh] md:max-h-full object-contain"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-xs text-amber-300 font-mono">
            {activePromptDetail.aspectRatio} · {activePromptDetail.model}
          </div>
        </div>

        {/* Right: Prompt Details & Parameters */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-5 bg-[#0f172a]">
          <div className="space-y-4">
            {/* Header Title & Actions */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  {activePromptDetail.category}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(activePromptDetail.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    <Heart size={14} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                    <span className="tabular-nums">{activePromptDetail.likes}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="Share"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white leading-tight">
                {isBn && activePromptDetail.titleBn
                  ? activePromptDetail.titleBn
                  : activePromptDetail.title}
              </h2>
            </div>

            {/* Prompt Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  {isBn ? 'মূল এআই প্রম্পট (Prompt):' : 'Master AI Prompt:'}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {activePromptDetail.prompt.length} chars
                </span>
              </div>
              <div className="relative p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed select-all">
                {activePromptDetail.prompt}
              </div>
            </div>

            {/* Negative Prompt if exists */}
            {activePromptDetail.negativePrompt && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  {isBn ? 'নেগেটিভ প্রম্পট (Negative):' : 'Negative Prompt:'}
                </span>
                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/80 text-[11px] text-rose-300/80 font-mono">
                  {activePromptDetail.negativePrompt}
                </div>
              </div>
            )}

            {/* Technical Parameters Grid */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 mb-2 block">
                {isBn ? 'প্যারামিটার ও সেটিংস' : 'Generation Parameters'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">AI Model</div>
                  <div className="font-medium text-amber-300">{activePromptDetail.model}</div>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Aspect Ratio</div>
                  <div className="font-medium text-slate-200">{activePromptDetail.aspectRatio}</div>
                </div>
                {activePromptDetail.seed && (
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Seed</div>
                    <div className="font-mono text-slate-200">{activePromptDetail.seed}</div>
                  </div>
                )}
                {activePromptDetail.cfgScale && (
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">CFG Scale</div>
                    <div className="font-mono text-slate-200">{activePromptDetail.cfgScale}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags (Rendered as clean unboxed text per Zero-Pill rule) */}
            {activePromptDetail.tags && activePromptDetail.tags.length > 0 && (
              <div className="pt-1 text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400">{isBn ? 'ট্যাগ:' : 'Tags:'}</span>
                {activePromptDetail.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    <span className="text-slate-300 font-medium">{tag}</span>
                    {i < activePromptDetail.tags.length - 1 && (
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs: Copy Prompt & Remix Studio */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => handleRequestCopy(activePromptDetail)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
            >
              <Copy size={16} />
              <span>
                {isBn
                  ? 'প্রম্পট কপি করুন (বিজ্ঞাপনসহ)'
                  : 'Copy Prompt (Sponsored Ad Wall)'}
              </span>
            </button>

            <button
              onClick={() => {
                setActivePromptDetail(null);
                setIsStudioOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>
                {isBn
                  ? 'এই প্রম্পট থেকে নতুন প্রম্পট তৈরি করুন'
                  : 'Remix / Enhance with Gemini AI'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
