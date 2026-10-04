import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ExternalLink } from 'lucide-react';

interface AdSenseBlockProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdSenseBlock: React.FC<AdSenseBlockProps> = ({
  slot = '8920194812',
  format = 'auto',
  className = '',
}) => {
  const { adSettings, language } = useApp();
  const adRef = useRef<HTMLModElement>(null);
  const isBn = language === 'bn';
  const pubId = adSettings.adsensePublisherId || 'ca-pub-9855677661793723';

  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;

    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.warn('AdSense push error or adblocker detected:', e);
    }
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900 border border-amber-500/20 p-3 ${className}`}>
      {/* Top Header Label */}
      <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Google AdSense ({pubId})</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
          {isBn ? 'বিজ্ঞাপন' : 'Advertisement'}
        </span>
      </div>

      {/* Actual Google AdSense ins element */}
      <div className="w-full flex justify-center min-h-[100px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={pubId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>

      {/* AdSense Live Status Indicator */}
      <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
        <span>ID: {pubId}</span>
        <span className="text-emerald-400 font-mono">● AdSense Script Active</span>
      </div>
    </div>
  );
};
