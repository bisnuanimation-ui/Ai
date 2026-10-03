import React from 'react';
import { Sparkles, Play } from 'lucide-react';

interface AnimeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  variant?: 'horizontal' | 'centered' | 'badge-only';
}

export const AnimeLogo: React.FC<AnimeLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
}) => {
  const fontSizes = {
    sm: 'text-sm tracking-tight leading-tight',
    md: 'text-lg sm:text-xl tracking-tight leading-none',
    lg: 'text-2xl sm:text-3xl tracking-tight leading-none',
    hero: 'text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none',
  };

  const badgeSizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
    lg: 'px-2.5 py-1 text-xs',
    hero: 'px-3 py-1 text-sm',
  };

  const sunSizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    hero: 'w-18 h-18 text-base',
  };

  if (variant === 'badge-only') {
    return (
      <div className={`relative rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fb923c] to-[#ea580c] flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/30 border-2 border-white/80 animate-pulse ${sunSizes[size]} ${className}`}>
        <span className="font-display tracking-tighter uppercase scale-90">ADITYA</span>
        <Sparkles className="w-2.5 h-2.5 text-amber-100 absolute -top-1 -right-1" />
      </div>
    );
  }

  if (variant === 'centered') {
    return (
      <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
        {/* Golden Sun Anime Circular Emblem */}
        <div className="relative mb-2 group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fb923c] to-[#ea580c] flex flex-col items-center justify-center text-white shadow-xl shadow-orange-500/35 border-2 border-white group-hover:scale-105 transition-transform duration-300">
            <span className="text-[11px] font-black font-display tracking-tight leading-none">ADITYA</span>
            <span className="text-[8px] font-mono font-bold tracking-widest text-amber-100 opacity-90">TV/HUB</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
        </div>
        <div className={`font-black uppercase flex items-center gap-1.5 ${fontSizes[size]}`}>
          <span className="text-[#ea580c] font-black tracking-wider">NIME</span>
          <span className="text-slate-800 dark:text-slate-100 font-black tracking-wider">GAMI</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`bg-orange-500/15 text-[#ea580c] font-extrabold rounded-full ${badgeSizes[size]}`}>
            ADITYA TV · AI ANIME PROMPTS
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Golden Sun Emblem (Matching uploaded image top-left) */}
      <div className="relative group flex items-center justify-center">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fb923c] to-[#ea580c] flex items-center justify-center text-white shadow-md shadow-orange-500/30 border-2 border-white group-hover:scale-105 transition-transform duration-200">
          <span className="text-[9px] font-black font-display tracking-tight">ADITYA</span>
        </div>
      </div>

      {/* Two-Tone Stacked NIME GAMI Brand Title */}
      <div className="flex flex-col">
        <div className={`font-black uppercase flex items-center gap-1 ${fontSizes[size]}`}>
          <span className="text-[#ea580c] font-black tracking-wider">NIME</span>
          <span className="text-slate-800 dark:text-slate-100 font-black tracking-wider">GAMI</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`bg-orange-500/10 text-[#ea580c] font-bold rounded-md ${badgeSizes[size]}`}>
            ADITYA TV
          </span>
          <span className="text-[10px] text-slate-400 font-medium">アニメ Hub</span>
        </div>
      </div>
    </div>
  );
};

export default AnimeLogo;

