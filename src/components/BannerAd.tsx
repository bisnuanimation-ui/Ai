import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink, Sparkles } from 'lucide-react';
import { AdCampaign } from '../types';

interface BannerAdProps {
  campaign?: AdCampaign;
}

export const BannerAd: React.FC<BannerAdProps> = ({ campaign }) => {
  const { adCampaigns, adSettings, onAdClick, onAdImpression, language } = useApp();
  const hasTrackedImpression = useRef(false);

  const activeCampaign =
    campaign ||
    adCampaigns.find((c) => c.id === adSettings.activeCampaignId) ||
    adCampaigns[0];

  useEffect(() => {
    if (!hasTrackedImpression.current && activeCampaign) {
      onAdImpression(activeCampaign);
      hasTrackedImpression.current = true;
    }
  }, [activeCampaign]);

  if (!activeCampaign) return null;

  const isBn = language === 'bn';

  const handleClick = () => {
    onAdClick(activeCampaign);
  };

  return (
    <div className="col-span-full my-3 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border border-amber-500/20 shadow-xl overflow-hidden relative group">
      {/* Decorative ambient gradient */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
        {/* Banner Graphic Thumbnail */}
        <div className="w-full md:w-56 h-32 md:h-28 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 relative">
          <img
            src={activeCampaign.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
            alt={activeCampaign.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded border border-amber-400/30">
            {isBn ? 'স্পন্সর' : 'Sponsored'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-amber-400 font-medium">
            <Sparkles size={13} />
            <span>{activeCampaign.sponsorName}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[11px]">{activeCampaign.badgeText}</span>
          </div>
          <h3 className="text-base md:text-lg font-bold text-white leading-snug">
            {activeCampaign.title}
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
            {activeCampaign.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full md:w-auto">
          <a
            href={activeCampaign.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="w-full md:w-auto flex items-center justify-center gap-2 py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>{activeCampaign.buttonText}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
