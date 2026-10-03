import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  X,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { AdSenseBlock } from './AdSenseBlock';

export const CopyAdModal: React.FC = () => {
  const {
    copyModalPrompt,
    setCopyModalPrompt,
    adSettings,
    adCampaigns,
    finalizeCopy,
    onAdClick,
    language,
  } = useApp();

  const totalSeconds = adSettings.countdownSeconds || 8;
  const [countdown, setCountdown] = useState<number>(totalSeconds);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasVisitedAd, setHasVisitedAd] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const autoCopyTriggered = useRef(false);

  // Active campaign
  const activeCampaign =
    adCampaigns.find((c) => c.id === adSettings.activeCampaignId) || adCampaigns[0];

  useEffect(() => {
    if (!copyModalPrompt) return;

    setCountdown(totalSeconds);
    setCopied(false);
    setHasVisitedAd(false);
    autoCopyTriggered.current = false;

    if (totalSeconds === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [copyModalPrompt, totalSeconds]);

  // Automatic copy when countdown reaches 0!
  useEffect(() => {
    if (countdown === 0 && copyModalPrompt && !autoCopyTriggered.current && !copied) {
      autoCopyTriggered.current = true;
      finalizeCopy(copyModalPrompt).then((success) => {
        if (success) {
          setCopied(true);
        }
      });
    }
  }, [countdown, copyModalPrompt, copied, finalizeCopy]);

  if (!copyModalPrompt) return null;

  const handleSponsorClick = () => {
    onAdClick(activeCampaign);
    setHasVisitedAd(true);
  };

  const handleManualCompleteCopy = async () => {
    const success = await finalizeCopy(copyModalPrompt);
    if (success) {
      setCopied(true);
      setTimeout(() => {
        setCopyModalPrompt(null);
        setCopied(false);
      }, 1500);
    }
  };

  const isBn = language === 'bn';
  const canCopy = countdown === 0 || adSettings.allowInstantSkip || hasVisitedAd;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - countdown) / totalSeconds) * 100));

  // Convert numbers to Bengali numerals if language is Bengali
  const toBnNum = (n: number) => {
    if (!isBn) return n.toString();
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().split('').map((d) => bnDigits[parseInt(d, 10)] || d).join('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() => setCopyModalPrompt(null)}
    >
      <div
        className="relative w-full max-w-xl bg-[#fffcf9] border border-orange-200/90 rounded-3xl shadow-[0_20px_70px_rgba(234,135,84,0.35)] overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Top Progress Bar */}
        <div className="w-full bg-orange-100 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ea8754] via-[#f5a478] to-[#d96526] transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(234,135,84,0.9)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-100 bg-[#fdf5ef] shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ea8754] bg-white px-3 py-1 rounded-full border border-orange-200 shadow-2xs font-mono">
              <Sparkles size={12} className="animate-spin text-[#ea8754]" />
              <span>{isBn ? 'স্পন্সর বিজ্ঞাপন ও এআই প্রম্পট' : 'Sponsored Sponsor Hub'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 8-Second Countdown Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
              canCopy
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#fcf2eb] text-[#ea8754] border border-[#f5c7ad] animate-pulse'
            }`}>
              <Clock size={13} className={canCopy ? 'text-emerald-600' : 'animate-spin text-[#ea8754]'} />
              <span>
                {canCopy
                  ? (isBn ? 'আনলক সম্পন্ন' : 'Ready')
                  : (isBn ? `${toBnNum(countdown)} সেকেন্ড বাকি` : `${countdown}s left`)}
              </span>
            </div>

            <button
              onClick={() => setCopyModalPrompt(null)}
              className="text-stone-400 hover:text-[#2b231f] p-1 rounded-lg hover:bg-orange-100/50 transition-colors cursor-pointer"
              title={isBn ? 'বন্ধ করুন' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Ad Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Explanation Banner: WHY WAIT 8 SECONDS? */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#fef4ee] via-[#fff9f5] to-[#fef4ee] border border-orange-200 p-3.5 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-[#ea8754] shrink-0 mt-0.5 border border-orange-200">
                <HelpCircle size={18} />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#2b231f] text-[13px] flex items-center gap-1.5">
                    <span>{isBn ? 'কেন ৮ সেকেন্ড অপেক্ষা করতে হবে?' : 'Why wait 8 seconds?'}</span>
                    <span className="text-[10px] font-bold text-[#ea8754] bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
                      {isBn ? '১০০% ফ্রি সুবিধা' : '100% Free'}
                    </span>
                  </h4>
                </div>
                <p className="text-[#6c5a52] leading-relaxed text-[11.5px]">
                  {isBn
                    ? 'আমাদের ওয়েবসাইটের সমস্ত প্রিমিয়াম এআই প্রম্পট ব্যবহারকারীদের জন্য সম্পূর্ণ ফ্রি। স্পনসরদের সহযোগিতা এবং ৮ সেকেন্ড বিজ্ঞাপন প্রদর্শনের মাধ্যমেই এই সেবা পরিচালিত হয়। ৮ সেকেন্ড পার হলেই প্রম্পটটি স্বয়ংক্রিয়ভাবে কপি হয়ে যাবে!'
                    : 'All premium AI prompts on this platform are 100% free. Sponsoring partners support our cloud infrastructure. After 8 seconds, your master prompt automatically unlocks and copies to your clipboard!'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Google AdSense Banner Block */}
          {adSettings.adNetworkMode !== 'custom' && (
            <div className="rounded-xl overflow-hidden border border-orange-100 bg-white p-2 text-center">
              <AdSenseBlock slot="8920194812" format="rectangle" />
            </div>
          )}

          {/* Sponsor Creative Media Card */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-orange-200 group shadow-lg">
            <img
              src={activeCampaign.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
              alt={activeCampaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 text-xs text-orange-300 font-semibold mb-1">
                <Zap size={14} className="text-[#ea8754] fill-[#ea8754]" />
                <span>{activeCampaign.sponsorName}</span>
                <span className="text-stone-400">·</span>
                <span className="text-orange-200 font-normal">{activeCampaign.badgeText}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                {activeCampaign.title}
              </h4>
            </div>
          </div>

          {/* Ad Description & Sponsor CTA Button */}
          <div className="space-y-3">
            <p className="text-xs text-[#6c5a52] leading-relaxed bg-white p-3 rounded-xl border border-orange-200/80">
              {activeCampaign.description}
            </p>

            <a
              href={activeCampaign.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSponsorClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#ea8754] hover:bg-[#d96526] text-white font-extrabold text-xs sm:text-sm rounded-full transition-all shadow-lg shadow-[#ea8754]/30 cursor-pointer active:scale-[0.99] uppercase tracking-wider"
            >
              <span>{activeCampaign.buttonText}</span>
              <ExternalLink size={15} />
            </a>
          </div>

          {/* Target Selected Prompt Micro-Box */}
          <div className="p-3 bg-white border border-orange-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#6c5a52]">
              <span className="font-bold text-[#2b231f] flex items-center gap-1.5">
                <Check size={12} className="text-emerald-500 stroke-[3]" />
                <span>{isBn ? 'আপনার কপি হতে যাওয়া প্রম্পট:' : 'Target Prompt to Copy:'}</span>
              </span>
              <span className="text-[#ea8754] font-mono text-[10px] bg-[#fcf2eb] px-2.5 py-0.5 rounded-full border border-orange-200 font-bold">
                {copyModalPrompt.model}
              </span>
            </div>
            <p className="text-[11px] text-[#6c5a52] font-mono line-clamp-2 italic leading-relaxed">
              "{copyModalPrompt.prompt}"
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer / Unlock Action */}
        <div className="px-5 py-4 border-t border-orange-100 bg-[#fdf5ef] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6c5a52] text-center sm:text-left">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>
              {isBn
                ? 'স্পনসরদের সহযোগিতায় প্রম্পটটি ১০০% ফ্রি'
                : '100% Free AI prompts supported by sponsors'}
            </span>
          </div>

          <div className="w-full sm:w-auto">
            {copied ? (
              <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-xs sm:text-sm font-extrabold rounded-full shadow-lg shadow-emerald-600/30 animate-in zoom-in-95 duration-200 uppercase tracking-wider">
                <Check size={16} className="stroke-[3]" />
                <span>{isBn ? '✓ প্রম্পট কপি সম্পন্ন হয়েছে!' : '✓ Prompt Copied to Clipboard!'}</span>
              </div>
            ) : canCopy ? (
              <button
                onClick={handleManualCompleteCopy}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ea8754] hover:bg-[#d96526] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-xl shadow-[#ea8754]/30 transition-all cursor-pointer animate-pulse active:scale-95 uppercase tracking-wider"
              >
                <Check size={16} className="stroke-[3]" />
                <span>{isBn ? 'এখনই প্রম্পট কপি করুন' : 'Copy Prompt Now'}</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-100/80 text-[#ea8754] font-bold text-xs sm:text-sm rounded-full border border-orange-200 cursor-not-allowed shadow-inner"
              >
                <Clock size={16} className="animate-spin text-[#ea8754]" />
                <span>
                  {isBn
                    ? `অপেক্ষা করুন (${toBnNum(countdown)} সেকেন্ড)...`
                    : `Please wait (${countdown}s)...`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

