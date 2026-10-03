import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { useApp } from '../context/AppContext';
import { Copy, Heart, Check, Sparkles } from 'lucide-react';

interface PromptCardProps {
  prompt: PromptItem;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const {
    handleRequestCopy,
    likedPromptIds,
    toggleLike,
    language,
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [prompt.imageUrl]);

  const isLiked = likedPromptIds.includes(prompt.id);
  const isBn = language === 'bn';

  const onCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleRequestCopy(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      onClick={onCopyClick}
      className="group relative rounded-[28px] bg-white border border-orange-200/80 hover:border-[#ea8754] transition-all duration-300 flex flex-col overflow-hidden shadow-[0_10px_25px_rgba(234,135,84,0.12)] hover:shadow-[0_18px_38px_rgba(234,135,84,0.22)] hover:-translate-y-1 cursor-pointer"
    >
      {/* Visual Image Container - Full Card Visual Presence */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#faf5f0]">
        {!imgError && prompt.imageUrl ? (
          <img
            src={prompt.imageUrl}
            alt={prompt.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#fef4ee] to-[#f9e5d7] p-4 text-center">
            <Sparkles size={32} className="text-[#ea8754] mb-2" />
            <span className="text-xs text-[#6c5a52] font-medium">{prompt.title}</span>
          </div>
        )}

        {/* Gradient Scrim for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges / Model Tag & Like Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            {prompt.model}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(prompt.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
              isLiked
                ? 'bg-rose-500/90 text-white shadow-md'
                : 'bg-black/50 text-white/90 hover:text-white border border-white/20'
            }`}
            title={isBn ? 'পছন্দ করুন' : 'Like'}
          >
            <Heart size={14} className={isLiked ? 'fill-white text-white' : ''} />
          </button>
        </div>

        {/* Bottom Prominent Copy Button & Clean Title Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between gap-3 z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-white truncate drop-shadow-md tracking-wide">
              {isBn && prompt.titleBn ? prompt.titleBn : prompt.title}
            </h3>
            <span className="text-[11px] text-orange-200 capitalize drop-shadow-sm block font-mono">
              {prompt.category} · {prompt.aspectRatio}
            </span>
          </div>

          {/* Iconic Capsule Pill Copy Button */}
          <button
            onClick={onCopyClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ea8754] hover:bg-[#d96526] text-white font-extrabold text-xs rounded-full shadow-lg shadow-[#ea8754]/35 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0 uppercase tracking-wider font-mono"
            title={isBn ? 'প্রম্পট কপি করুন' : 'Copy AI Prompt'}
          >
            {copied ? <Check size={14} className="stroke-[3]" /> : <Copy size={13} className="stroke-[2.5]" />}
            <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'COPIED') : (isBn ? 'কপি করুন' : 'COPY')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

