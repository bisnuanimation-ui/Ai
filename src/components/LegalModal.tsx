import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Info, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type LegalTab = 'privacy' | 'terms' | 'about' | 'contact';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const { language } = useApp();
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<LegalTab>(defaultTab);

  // Sync default tab if changed when opened
  React.useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-white to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ea8754]/10 text-[#ea8754] flex items-center justify-center">
              {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5 text-[#ea8754]" />}
              {activeTab === 'terms' && <FileText className="w-5 h-5 text-[#ea8754]" />}
              {activeTab === 'about' && <Info className="w-5 h-5 text-[#ea8754]" />}
              {activeTab === 'contact' && <Mail className="w-5 h-5 text-[#ea8754]" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2b231f]">
                {activeTab === 'privacy' && (isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy')}
                {activeTab === 'terms' && (isBn ? 'ব্যবহারের শর্তাবলী (Terms of Service)' : 'Terms of Service')}
                {activeTab === 'about' && (isBn ? 'আমাদের সম্পর্কে (About Us)' : 'About Us')}
                {activeTab === 'contact' && (isBn ? 'যোগাযোগ করুন (Contact Us)' : 'Contact Us')}
              </h3>
              <p className="text-xs text-[#6c5a52]">
                {isBn ? 'নিমেগামি এআই প্রম্পট স্টুডিও অফিসিয়াল লিগ্যাল ও তথ্য কেন্দ্র' : 'NimeGami AI Anime Prompt Studio Official Policies'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-orange-100 text-stone-500 hover:text-[#ea8754] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-orange-100 bg-stone-50/60 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'privacy'
                ? 'border-[#ea8754] text-[#ea8754]'
                : 'border-transparent text-[#6c5a52] hover:text-[#2b231f]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'terms'
                ? 'border-[#ea8754] text-[#ea8754]'
                : 'border-transparent text-[#6c5a52] hover:text-[#2b231f]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isBn ? 'শর্তাবলী' : 'Terms'}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'about'
                ? 'border-[#ea8754] text-[#ea8754]'
                : 'border-transparent text-[#6c5a52] hover:text-[#2b231f]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{isBn ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'contact'
                ? 'border-[#ea8754] text-[#ea8754]'
                : 'border-transparent text-[#6c5a52] hover:text-[#2b231f]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isBn ? 'যোগাযোগ' : 'Contact'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-sm leading-relaxed text-[#4a3f39] space-y-4 max-h-[60vh]">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs text-orange-950 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#ea8754] shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'এই প্রাইভেসি পলিসি গুগল অ্যাডসেন্স (Google AdSense) ও আন্তর্জাতিক ডাটা সুরক্ষা আইনের সাথে সম্পূর্ণ সঙ্গতিপূর্ণ।'
                    : 'This Privacy Policy is designed to comply with Google AdSense, GDPR, and standard web data protection guidelines.'}
                </span>
              </div>

              <section>
                <h4 className="font-bold text-[#2b231f] text-base mb-1.5">
                  {isBn ? '১. সংগৃহীত তথ্যাবলী (Information We Collect)' : '1. Information We Collect'}
                </h4>
                <p className="text-xs text-[#6c5a52]">
                  {isBn
                    ? 'NimeGami ব্যবহারকারীদের ব্যক্তিগত পরিচয়সূচক তথ্য (PII) ছাড়াই অবাধে ব্যবহারের সুযোগ দেয়। ওয়েবসাইট ব্যবহারে সুবিধার্থে আমরা লোকাল স্টোরেজ (Local Storage) এবং কুকিজ ব্যবহার করি (যেমন: আপনার কপি হিস্ট্রি, ফেভারিট তালিকা ও ভাষা নির্বাচন)।'
                    : 'NimeGami allows free exploration of AI anime prompts without requiring personal registration. We use standard browser local storage and cookies to retain your saved favorites, copy counts, and language preference.'}
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2b231f] text-base mb-1.5">
                  {isBn ? '২. গুগল অ্যাডসেন্স ও কুকিজ (Google AdSense & Cookies)' : '2. Google AdSense & Cookies'}
                </h4>
                <p className="text-xs text-[#6c5a52]">
                  {isBn
                    ? 'আমাদের ওয়েবসাইটে প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শনের জন্য Google AdSense ও তৃতীয় পক্ষের বিজ্ঞাপন নেটওয়ার্ক ব্যবহৃত হতে পারে। গুগল ব্যবহারকারীদের পূর্ববর্তী ব্রাউজিং তথ্যের ওপর ভিত্তি করে বিজ্ঞাপন প্রদর্শন করতে DoubleClick DART কুকি ব্যবহার করে থাকে।'
                    : 'Google, as a third-party vendor, may use cookies (including the DoubleClick DART cookie) to serve relevant advertisements to our visitors based on their visits to this site and other websites on the internet.'}
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2b231f] text-base mb-1.5">
                  {isBn ? '৩. ব্যবহারকারীর অধিকার ও নিয়ন্ত্রণ (User Data Rights)' : '3. Your Rights & Options'}
                </h4>
                <p className="text-xs text-[#6c5a52]">
                  {isBn
                    ? 'আপনি আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ নিষ্ক্রিয় করতে পারেন। গুগল বিজ্ঞাপনের সেটিংস পরিবর্তন করতে Google Ads Settings পরিদর্শন করতে পারেন।'
                    : 'You may choose to disable cookies through your browser settings or opt-out of personalized advertising via Google Ads Settings.'}
                </p>
              </section>

              <div className="pt-2 text-[11px] text-[#8c786e]">
                {isBn ? 'সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬' : 'Last Updated: October 2026'}
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <section>
                <h4 className="font-bold text-[#2b231f] text-base mb-1.5">
                  {isBn ? '১. সেবার সাধারণ নীতিমালা' : '1. Acceptance of Terms'}
                </h4>
                <p className="text-xs text-[#6c5a52]">
                  {isBn
                    ? 'নিমেগামি ওয়েবসাইটে প্রবেশের মাধ্যমে আপনি সকল শর্ত মেনে নিচ্ছেন। এখানে প্রদত্ত সকল এআই প্রম্পট শিক্ষা, গবেষণা ও ক্রিয়েটিভ প্রজেক্টে ব্যবহারের জন্য উন্মুক্ত।'
                    : 'By accessing NimeGami, you agree to these terms. All prompts and artwork showcases provided here are intended for creative, educational, and productive digital artwork generation.'}
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2b231f] text-base mb-1.5">
                  {isBn ? '২. কপিরাইট ও প্রম্পট ব্যবহার অধিকার' : '2. Prompt Ownership & AI Rights'}
                </h4>
                <p className="text-xs text-[#6c5a52]">
                  {isBn
                    ? 'এখানে কিউরেট করা প্রতিটি প্রম্পট Midjourney, Stable Diffusion বা Flux মডেলে ব্যবহার করে তৈরি করা ছবি আপনার নিজস্ব সৃজনশীল কাজের অংশ। তবে ওয়েবসাইটটির কোড, লোগো এবং ব্র্যান্ডিং স্বত্ব সংরক্ষিত।'
                    : 'Generations resulting from copied AI prompts can be used in your own creative projects. NimeGami branding, code, and logo elements remain the intellectual property of Thakurgaon Studio.'}
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#2b231f] text-base mb-1.5">
                  {isBn ? '৩. নিষিদ্ধ কার্যকলাপ' : '3. Prohibited Usage'}
                </h4>
                <p className="text-xs text-[#6c5a52]">
                  {isBn
                    ? 'ওয়েবসাইটে কোনো প্রকার ক্ষতিকর স্ক্রিপ্ট চালানো, বিজ্ঞাপন ব্যবস্থায় জালিয়াতি করা বা স্বয়ংক্রিয় বট দিয়ে প্ল্যাটফর্ম ক্ষতিগ্রস্ত করার চেষ্টা সম্পূর্ণ নিষিদ্ধ।'
                    : 'Automated scraping, attempting to disrupt advertising mechanisms, or abusive bot requests are strictly prohibited.'}
                </p>
              </section>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-12 h-12 rounded-xl bg-[#ea8754] text-white flex items-center justify-center font-black text-xl shadow-md">
                  NG
                </div>
                <div>
                  <h4 className="font-bold text-[#2b231f] text-base">NimeGami Studio</h4>
                  <p className="text-xs text-[#6c5a52]">
                    {isBn ? 'প্রিমিয়াম অ্যানিমে ও ডিজিটাল আর্ট প্রম্পট হাব' : 'Premium Anime & Manga AI Prompt Studio'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#6c5a52] leading-relaxed">
                {isBn
                  ? 'নিমেগামি (NimeGami) হলো অ্যানিমেপ্রেমী, ডিজিটাল আর্টিস্ট ও কন্টেন্ট ক্রিয়েটরদের জন্য নির্মিত একটি আধুনিক এআই প্রম্পট লাইব্রেরি। ঠাকুরগাঁও স্টুডিও এবং আদিত্য-এর উদ্যোগে আমরা মিডজার্নি (Midjourney v6), নিজি (Niji 6) এবং স্ট্যাবল ডিফিউশনের সর্বোচ্চ মানের প্রম্পট নিখুঁত প্যারামিটারসহ সহজে কপি করার সুবিধা প্রদান করি।'
                  : 'NimeGami is a curated creative hub for digital anime artists and creators. Powered by Thakurgaon Studio & Aditya, we deliver tested prompts optimized for Midjourney v6, Niji 6, and Stable Diffusion XL with instant 1-click workflows.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                  <div className="text-xs font-bold text-[#ea8754] mb-0.5">
                    {isBn ? 'সঠিক প্যারামিটার' : 'Tested Parameters'}
                  </div>
                  <div className="text-[11px] text-[#6c5a52]">
                    {isBn ? 'আস্পেক্ট রেশিও ও মডেল কিউরেটেড' : 'Curated AR & tested model weights'}
                  </div>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                  <div className="text-xs font-bold text-[#ea8754] mb-0.5">
                    {isBn ? 'বিজ্ঞাপন সাপোর্ট' : 'Sponsor Hub'}
                  </div>
                  <div className="text-[11px] text-[#6c5a52]">
                    {isBn ? 'লোকাল ও গ্লোবাল স্পনসর পার্টনারশিপ' : 'Thakurgaon Clothing & local brands'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6c5a52]">
                {isBn
                  ? 'বিজ্ঞাপন দেওয়া, কাস্টম প্রম্পট পার্টনারশিপ বা কোনো টেকনিক্যাল অনুসন্ধানের জন্য আমাদের সাথে যেকোনো সময় যোগাযোগ করতে পারেন:'
                  : 'For sponsorship inquiries, custom prompt curation, or technical questions, feel free to reach out to our team:'}
              </p>

              <div className="space-y-2.5">
                <a
                  href="mailto:bisnuroy283@gmail.com"
                  className="flex items-center justify-between p-3.5 bg-orange-50/60 hover:bg-orange-100/70 border border-orange-200/80 rounded-2xl transition-colors group text-xs text-[#2b231f]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#ea8754] flex items-center justify-center shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">ইমেইল (Official Email)</div>
                      <div className="text-[#6c5a52] text-[11px]">bisnuroy283@gmail.com</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#ea8754]" />
                </a>

                <a
                  href="https://www.facebook.com/share/14tSwFz9SXh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 rounded-2xl transition-colors group text-xs text-[#2b231f]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#1877F2] flex items-center justify-center shadow-xs">
                      <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold">ফেসবুক পেজ (Facebook Page)</div>
                      <div className="text-[#6c5a52] text-[11px]">facebook.com/share/14tSwFz9SXh</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#1877F2]" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-orange-100 flex items-center justify-between text-xs">
          <span className="text-[#8c786e]">
            {isBn ? 'নিমেগামি স্টুডিও • ঠাকুরগাঁও' : 'NimeGami Studio • Thakurgaon'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#ea8754] hover:bg-[#d6723e] text-white font-bold rounded-full transition-colors cursor-pointer shadow-sm shadow-[#ea8754]/30"
          >
            {isBn ? 'বুঝেছি / বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
