import React from 'react';
import { useApp } from '../context/AppContext';
import { AnimeLogo } from './AnimeLogo';
import { Shield, Sparkles, Globe, Search, Plus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    setIsAdminOpen,
    isAdminLoggedIn,
    setIsStudioOpen,
    setIsQuickPostOpen,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const isBn = language === 'bn';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fcf9f6]/90 backdrop-blur-md border-b border-orange-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand: Logo & Wordmark (Styled like NIME GAMI in uploaded image) */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 shrink-0 group">
            <AnimeLogo size="md" />
          </a>
        </div>

        {/* Center: Clean Anime Navigation Links (Matching uploaded image) */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wide text-[#6c5a52]">
          <a href="/" className="text-[#ea8754] hover:text-[#d96526] transition-colors">
            {isBn ? 'হোম' : 'About'}
          </a>
          <a href="#gallery" className="hover:text-[#ea8754] transition-colors">
            {isBn ? 'প্রম্পট লিস্ট' : 'Anime List'}
          </a>
          <button
            onClick={() => setIsStudioOpen(true)}
            className="hover:text-[#ea8754] transition-colors cursor-pointer"
          >
            {isBn ? 'এআই স্টুডিও' : 'Manga AI'}
          </button>
          <a
            href="https://www.facebook.com/share/14tSwFz9SXh/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ea8754] transition-colors"
          >
            {isBn ? 'কমিউনিটি' : 'Community'}
          </a>
        </nav>

        {/* Right Side: Search & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden sm:block w-40 md:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ea8754]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'প্রম্পট খুঁজুন...' : 'Search anime prompts...'}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-orange-200/80 rounded-full text-xs text-[#2b231f] placeholder-orange-300 focus:outline-hidden focus:border-[#ea8754] focus:ring-2 focus:ring-[#ea8754]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* 1-Click Quick Post Pill Button (Matching Daftar Sekarang in image) */}
          <button
            onClick={() => setIsQuickPostOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-[#ea8754] hover:bg-[#d96526] rounded-full shadow-md shadow-[#ea8754]/25 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title={isBn ? '১-ক্লিক পোস্ট' : 'Quick Post'}
          >
            <Plus size={13} className="stroke-[3]" />
            <span>{isBn ? 'পোস্ট করুন' : 'Daftar Post'}</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              isAdminLoggedIn
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-white text-[#6c5a52] hover:text-[#ea8754] border border-orange-200/70 shadow-2xs'
            }`}
            title={isBn ? 'এডমিন প্যানেল' : 'Admin Panel'}
          >
            <Shield size={13} className="text-[#ea8754]" />
            <span className="hidden sm:inline">{isBn ? 'এডমিন' : 'Admin'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(isBn ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#6c5a52] hover:text-[#ea8754] bg-white border border-orange-200/70 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Switch Language"
          >
            <Globe size={12} className="text-[#ea8754]" />
            <span className="font-semibold text-[11px]">{isBn ? 'EN' : 'বাং'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-2.5">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ea8754]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'প্রম্পট খুঁজুন...' : 'Search anime prompts...'}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-orange-200/80 rounded-full text-xs text-[#2b231f] placeholder-orange-300 focus:outline-hidden focus:border-[#ea8754]"
          />
        </div>
      </div>
    </header>
  );
};

