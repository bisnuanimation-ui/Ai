import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PromptCard } from './components/PromptCard';
import { BannerAd } from './components/BannerAd';
import { AdSenseBlock } from './components/AdSenseBlock';
import { CopyAdModal } from './components/CopyAdModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { GeminiPromptStudio } from './components/GeminiPromptStudio';
import { QuickPostModal } from './components/QuickPostModal';
import { AnimeLogo } from './components/AnimeLogo';
import { ThakurgaonLogo } from './components/ThakurgaonLogo';
import { Sparkles, Shield, Filter, Search, Layers, CheckCircle, Plus, ChevronRight, ChevronLeft, MoreHorizontal, Award } from 'lucide-react';

const GalleryView: React.FC = () => {
  const {
    prompts,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    selectedModel,
    setSelectedModel,
    adSettings,
    setIsStudioOpen,
    setIsAdminOpen,
    isQuickPostOpen,
    setIsQuickPostOpen,
    handleRequestCopy,
    language,
    toastMessage,
    likedPromptIds,
  } = useApp();

  const isBn = language === 'bn';

  // Carousel & Animation States for Top 3 Showcase
  const [heroIndex, setHeroIndex] = useState(0);
  const [popularOffset, setPopularOffset] = useState(0);
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Top 3 anime showcase items
  const topAnimePrompts = prompts.slice(0, 3);

  // Auto cycle top hero banner every 5 seconds
  useEffect(() => {
    if (topAnimePrompts.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % topAnimePrompts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [topAnimePrompts.length]);

  // Filter prompts
  const filteredPrompts = prompts.filter((p) => {
    const matchesCat =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? likedPromptIds.includes(p.id)
        : p.category === selectedCategory;
    const matchesModel = selectedModel === 'all' || p.model === selectedModel;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      (p.titleBn && p.titleBn.toLowerCase().includes(query)) ||
      p.prompt.toLowerCase().includes(query) ||
      p.model.toLowerCase().includes(query) ||
      p.tags?.some((t) => t.toLowerCase().includes(query));

    return matchesCat && matchesModel && matchesQuery;
  });

  const featuredPrompt = topAnimePrompts[heroIndex] || filteredPrompts[0] || prompts[0];

  // Most Popular items slice with wrap-around
  const popularCards = [
    prompts[(popularOffset + 0) % prompts.length],
    prompts[(popularOffset + 1) % prompts.length],
    prompts[(popularOffset + 2) % prompts.length],
  ].filter(Boolean);

  const currentSpotlight = topAnimePrompts[spotlightIndex] || prompts[0];

  const handleNextPopular = () => {
    setPopularOffset((prev) => (prev + 1) % prompts.length);
  };

  const handlePrevPopular = () => {
    setPopularOffset((prev) => (prev - 1 + prompts.length) % prompts.length);
  };

  return (
    <div className="min-h-screen bg-[#f6eee7] text-[#2b231f] flex flex-col font-sans selection:bg-[#ea8754] selection:text-white relative overflow-x-hidden">
      {/* Background Screentone Dots & Subtle Warm Lighting */}
      <div className="fixed inset-0 manga-screentone-bg pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[#ea8754]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 right-10 w-[500px] h-[500px] bg-[#f4a274]/15 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Top Banner Tag: Made By Aditya Anime Header (Matching Mockup top) */}
      <div className="w-full bg-[#ea8754] text-white py-1.5 px-4 text-center text-xs font-black tracking-widest uppercase shadow-xs flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
        <span className="font-display">MADE BY ADITYA · AI ANIME & MANGA STUDIO</span>
        <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
      </div>

      <Navbar />

      {/* SECTION 1: TOP HERO BANNER (Row 1 of Mockup) */}
      <section className="relative pt-6 pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-[32px] bg-white border border-orange-200/80 shadow-[0_20px_50px_rgba(234,135,84,0.12)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Col: Floating Featured Anime Character Showcase with Interactive Carousel Dots */}
            <div className="lg:col-span-6 relative p-6 sm:p-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#fcf7f3] via-[#faede3] to-[#f4ded0] border-b lg:border-b-0 lg:border-r border-orange-200/60 overflow-hidden min-h-[360px]">
              {/* Background Geometric Halftone Arc */}
              <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-[#ea8754]/10 pointer-events-none" />
              <div className="absolute right-6 top-6 w-32 h-32 rounded-full border border-orange-300/40 pointer-events-none" />

              {/* Centered Golden Sun Anime Emblem (Requested: মাঝখানে এই লোগোটা থাকে) */}
              <div className="absolute top-4 left-4 z-20">
                <AnimeLogo variant="badge-only" size="md" />
              </div>

              {featuredPrompt && (
                <div 
                  onClick={() => handleRequestCopy(featuredPrompt)}
                  className="relative group cursor-pointer animate-float-gentle max-w-xs sm:max-w-sm w-full"
                >
                  <div className="relative rounded-2xl overflow-hidden border-3 border-white shadow-2xl shadow-orange-950/20 aspect-4/3 sm:aspect-16/10">
                    <img
                      src={featuredPrompt.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                      alt={featuredPrompt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono tracking-widest text-orange-300 uppercase font-black bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
                          {featuredPrompt.model}
                        </span>
                        <span className="text-[10px] font-bold text-amber-200 bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-300/40">
                          GRADE S+
                        </span>
                      </div>
                      <h3 className="text-base font-black truncate drop-shadow-md">
                        {isBn && featuredPrompt.titleBn ? featuredPrompt.titleBn : featuredPrompt.title}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Carousel Pagination Dots (Clickable to switch between 3 showcase photos) */}
              <div className="flex items-center gap-2 mt-5 z-10">
                {topAnimePrompts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`transition-all duration-300 cursor-pointer ${
                      heroIndex === idx
                        ? 'w-6 h-2.5 rounded-full bg-[#ea8754]'
                        : 'w-2.5 h-2.5 rounded-full bg-orange-200 hover:bg-orange-300'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Col: Bold Headline & Japanese/Anime Editorial Copy */}
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#fcf2eb] border border-[#f5c7ad] rounded-full text-xs font-black text-[#ea8754] uppercase tracking-wider shadow-2xs">
                <Sparkles size={13} className="text-[#ea8754]" />
                <span>{isBn ? 'আদিত্য টিভি · অফিশিয়াল অ্যানিমে হাব' : 'ADITYA TV · OFFICIAL ANIME HUB'}</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl lg:text-4.5xl font-black text-[#2b231f] uppercase tracking-tight leading-[1.12] font-display">
                  STREAMING ALL TYPES MANGAS AND ANIME{' '}
                  <span className="text-[#ea8754] block sm:inline">ONLY AVAILABLE ON</span>{' '}
                  ADITYA TV!
                </h1>
                <p className="text-xs sm:text-sm text-[#6c5a52] leading-relaxed font-medium">
                  {isBn
                    ? 'চেনস ম্যান, নারুতো, স্পাই এক্স ফ্যামিলি এবং ফ্যাশন অ্যানিমে প্রম্পটস। ৮ সেকেন্ডের স্পনসর টাইমার শেষে সম্পূর্ণ প্রম্পট ফ্রিতে ক্লিপবোর্ডে কপি করুন।'
                    : 'Streaming high quality anime & manga prompts for Midjourney, Niji 6 and Stable Diffusion. Unlocked with 8s sponsor spotlight.'}
                </p>
              </div>

              {/* Action Buttons (Matching VISIT and VIEW MORE from Mockup) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {featuredPrompt && (
                  <button
                    onClick={() => handleRequestCopy(featuredPrompt)}
                    className="px-7 py-3.5 bg-[#ea8754] hover:bg-[#d96526] text-white font-black text-xs sm:text-sm rounded-full shadow-lg shadow-[#ea8754]/35 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                  >
                    {isBn ? 'VISIT · কপি করুন' : 'VISIT NOW'}
                  </button>
                )}

                <button
                  onClick={() => setIsStudioOpen(true)}
                  className="px-6 py-3.5 bg-white hover:bg-orange-50 text-[#2b231f] font-black text-xs sm:text-sm rounded-full border border-orange-200 shadow-2xs cursor-pointer transition-colors uppercase tracking-wider"
                >
                  <span className="text-[#ea8754] mr-1.5">⚡</span>
                  <span>{isBn ? 'VIEW MORE' : 'VIEW MORE'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MOST POPULAR SHOWCASE (Row 2 of Mockup with Grade Badges, Next/Prev) */}
      <section className="relative pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-[32px] bg-white border border-orange-200/80 shadow-[0_20px_50px_rgba(234,135,84,0.1)] overflow-hidden p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Header Block: Orange Accent Card with "MOST POPULAR" Title */}
            <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-[#ea8754] via-[#f97316] to-[#e07138] p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg shadow-[#ea8754]/25 min-h-[180px] lg:min-h-[300px]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-200 block mb-1">
                  TOP TRENDING
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight font-display">
                  MOST POPULAR
                </h2>
              </div>
              <div className="text-xs text-orange-100 font-medium">
                {isBn
                  ? 'জনপ্রিয় ৩টি ট্রেন্ডিং অ্যানিমে ও ক্যারেক্টার প্রম্পট'
                  : 'Highest rated community curated master prompts'}
              </div>
            </div>

            {/* Right: 3 Popular Animated Cards with Grade Badges & 3-Dot Menus */}
            <div className="lg:col-span-9 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {popularCards.map((p, idx) => {
                  const grades = ['GRADE S+', 'GRADE S', 'GRADE A+'];
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleRequestCopy(p)}
                      className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-900 border border-orange-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                    >
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Top Grade Badge & 3-Dot Icon (Matching Mockup) */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 bg-[#ea8754] text-white text-[10px] font-black rounded-full shadow-md font-mono tracking-wider">
                          {grades[idx % grades.length]}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center">
                          <MoreHorizontal size={14} />
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-orange-300">
                          {p.model}
                        </span>
                        <h4 className="text-sm font-black truncate leading-snug">
                          {isBn && p.titleBn ? p.titleBn : p.title}
                        </h4>
                        <p className="text-[10px] text-slate-300 line-clamp-1 italic mt-0.5">
                          "{p.prompt}"
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between">
                          <span className="text-[10px] text-orange-200 font-mono font-bold">
                            {p.copyCount} COPIES
                          </span>
                          <span className="px-3 py-1 bg-[#ea8754] text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                            {isBn ? 'কপি' : 'COPY'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive NEXT and PREVIOS Navigation Controls (Matching Mockup) */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea8754]" />
                  <span className="w-2 h-2 rounded-full bg-orange-200" />
                  <span className="w-2 h-2 rounded-full bg-orange-200" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPopular}
                    className="px-4 py-1.5 rounded-full border border-orange-300 bg-white hover:bg-orange-50 text-[#2b231f] text-xs font-black uppercase tracking-wider shadow-2xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                    <span>PREVIOS</span>
                  </button>
                  <button
                    onClick={handleNextPopular}
                    className="px-5 py-1.5 rounded-full bg-[#ea8754] hover:bg-[#d96526] text-white text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>NEXT</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SPOTLIGHT FEATURE CARD (Row 3 of Mockup with 8.6 Score & Back Button) */}
      <section className="relative pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-[32px] bg-white border border-orange-200/80 shadow-[0_20px_50px_rgba(234,135,84,0.1)] overflow-hidden">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[380px] items-center">
            {/* Background Manga Halftone and Warm Diagonal Split */}
            <div className="absolute inset-0 apricot-diagonal-bg pointer-events-none opacity-40" />

            {/* Top Left Sun Badge (Requested: মাঝখানে এই লোগোটা থাকে) */}
            <div className="absolute top-4 left-4 z-20">
              <AnimeLogo variant="badge-only" size="md" />
            </div>

            {/* Left Col: Frosted Glass Character Detail Box */}
            <div className="lg:col-span-7 p-6 sm:p-10 relative z-10">
              <div className="relative backdrop-blur-xl bg-white/85 border border-white/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-orange-950/5 space-y-4 max-w-lg">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-[#ea8754] font-display uppercase tracking-tight">
                    {currentSpotlight.title.includes('Chainsaw') ? 'CHAINSAW MAN' : currentSpotlight.title}
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#6c5a52] bg-orange-100/80 px-2.5 py-0.5 rounded-full">
                    Episodes 12 · Ongoing
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#5a4840] leading-relaxed font-medium">
                  {isBn
                    ? 'এমন একটি পৃথিবী যেখানে মানুষের ভয়গুলি মারাত্মক রূপ নেয়। মানুষের পাশে দাঁড়িয়ে অপশক্তি দমন করতে ডেনজি ও পাওয়ারের অনন্য অ্যানিমে লড়াই।'
                    : 'A man takes place in a world where human fears take physical form and become dangerous devils, who lend their powers to humans to wreak havoc across the Earth.'}
                </p>

                <div className="text-xs text-[#2b231f] font-bold">
                  <span className="text-[#ea8754]">Genre:</span> Action ; Adventure ; Anime Dark Fantasy
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleRequestCopy(currentSpotlight)}
                    className="px-6 py-2.5 bg-[#ea8754] hover:bg-[#d96526] text-white text-xs font-black rounded-full shadow-md shadow-[#ea8754]/30 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
                  >
                    {isBn ? 'WATCH & COPY' : 'WATCH NOW'}
                  </button>
                  <span className="text-[11px] text-[#6c5a52] font-semibold">
                    Status - Ongoing
                  </span>
                </div>

                {/* Prominent Circular 8.6 Rating Badge (Matching Mockup Row 3) */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fb923c] to-[#ea8754] text-white flex flex-col items-center justify-center font-black text-xs shadow-xl shadow-orange-500/35 border-3 border-white">
                  <span className="leading-none text-base font-display">8.6</span>
                  <span className="text-[8px] font-mono tracking-widest uppercase opacity-95">GRADE</span>
                </div>
              </div>

              {/* Back Button & Dots (Matching Mockup Row 3) */}
              <div className="mt-6 flex items-center justify-between max-w-lg">
                <button
                  onClick={() => setSpotlightIndex((prev) => (prev - 1 + topAnimePrompts.length) % topAnimePrompts.length)}
                  className="px-5 py-1.5 bg-white hover:bg-orange-50 border border-orange-300 rounded-full text-xs font-black text-[#2b231f] uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  BACK
                </button>
                <div className="flex items-center gap-1.5">
                  {topAnimePrompts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSpotlightIndex(i)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                        spotlightIndex === i ? 'bg-[#ea8754] w-4' : 'bg-orange-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Big Character Illustration */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 flex items-center justify-center p-6 overflow-hidden">
              <img
                src={currentSpotlight.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                alt={currentSpotlight.title}
                className="w-full h-full object-cover rounded-2xl shadow-xl shadow-orange-950/15 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & Model Selector (Capsule Pill Bar) */}
      <section id="gallery" className="sticky top-16 z-30 bg-[#fcf9f6]/95 backdrop-blur-md border-y border-orange-200/70 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Filter Capsule Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#ea8754] text-white shadow-md shadow-[#ea8754]/30'
                    : 'bg-white text-[#6c5a52] hover:text-[#ea8754] border border-orange-200/80'
                }`}
              >
                {isBn ? cat.nameBn : cat.nameEn}
              </button>
            ))}

            {/* Saved / Favorites Category Tab */}
            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === 'favorites'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-white text-[#6c5a52] hover:text-rose-500 border border-orange-200/80'
              }`}
              title={isBn ? 'পছন্দের প্রম্পট তালিকা' : 'Saved Favorites'}
            >
              <span>♥</span>
              <span>{isBn ? 'পছন্দ' : 'FAVORITES'}</span>
              {likedPromptIds.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-600 font-mono">
                  {likedPromptIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Model Filter Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] text-[#6c5a52] font-bold tracking-wider uppercase">
              {isBn ? 'মডেল ফিল্টার:' : 'MODEL:'}
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="p-1.5 bg-white border border-orange-200/90 rounded-full text-xs text-[#2b231f] cursor-pointer focus:outline-hidden focus:border-[#ea8754] font-medium shadow-2xs"
            >
              <option value="all">{isBn ? 'সকল মডেল' : 'ALL MODELS'}</option>
              <option value="Midjourney v6">Midjourney v6</option>
              <option value="Flux.1 Schnell">Flux.1 Schnell</option>
              <option value="Stable Diffusion XL">Stable Diffusion XL</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content Feed */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Top Featured Google AdSense Block */}
        <AdSenseBlock slot="8920194812" format="horizontal" />

        {/* Informative How-It-Works Notice Banner */}
        <div className="mb-6 p-4 bg-white border border-orange-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-[#6c5a52]">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-[#ea8754] flex items-center justify-center shrink-0 font-bold">
              ⚡
            </div>
            <span>
              {isBn
                ? 'নির্দেশিকা: যেকোনো ছবির "কপি করুন" বাটনে ক্লিক করলে ৮ সেকেন্ড স্পনসর বিজ্ঞাপন দেখাবে এবং সময় শেষ হলে প্রম্পটটি স্বয়ংক্রিয়ভাবে ক্লিপবোর্ডে কপি হয়ে যাবে!'
                : 'Guide: Click "Copy" on any artwork to view the 8-second sponsor spotlight. The master AI prompt will automatically copy when ready!'}
            </span>
          </div>
          <span className="shrink-0 text-[11px] font-mono font-bold text-[#ea8754] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {isBn ? '৮ সেকেন্ড স্পনসর আনলক' : '8s SPONSOR UNLOCK'}
          </span>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-xs text-[#6c5a52] font-semibold">
            {isBn ? (
              <span>
                মোট <strong className="text-[#ea8754] font-mono">{filteredPrompts.length}</strong> টি প্রম্পট পাওয়া গেছে
              </span>
            ) : (
              <span>
                Showing <strong className="text-[#ea8754] font-mono">{filteredPrompts.length}</strong> master prompts
              </span>
            )}
          </div>

          {adSettings.adWallEnabled && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#ea8754] bg-orange-50 px-3 py-1 rounded-full border border-orange-200 font-medium">
              <CheckCircle size={12} />
              <span>
                {isBn
                  ? '৮ সেকেন্ড কপি-অ্যাড সক্রিয়'
                  : '8s Monetized Copy Wall Active'}
              </span>
            </div>
          )}
        </div>

        {/* Prompts Bento Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt, idx) => (
              <React.Fragment key={`${prompt.id}-${idx}`}>
                <PromptCard prompt={prompt} />

                {/* In-feed sponsored banner ad after every 3 items if enabled */}
                {adSettings.showInFeedBanners && (idx + 1) % 3 === 0 && (
                  <BannerAd />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-orange-200/80 space-y-3 shadow-xs">
            <Search size={32} className="mx-auto text-orange-300" />
            <h3 className="text-base font-bold text-[#2b231f]">
              {isBn ? 'কোনো প্রম্পট পাওয়া যায়নি' : 'No Prompts Found'}
            </h3>
            <p className="text-xs text-[#6c5a52] max-w-md mx-auto">
              {isBn
                ? 'অন্য কোনো শব্দ দিয়ে সার্চ করুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।'
                : 'Try adjusting your search terms or filter criteria.'}
            </p>
          </div>
        )}
      </main>

      {/* Footer with Branding & Clean Anime Links */}
      <footer className="mt-auto border-t border-orange-200/80 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AnimeLogo size="sm" />
            <div className="text-left">
              <span className="text-[10px] text-[#6c5a52]">
                {isBn
                  ? '© ২০২৬ নিমেগামি এআই প্রম্পট স্টুডিও। সর্বস্বত্ব সংরক্ষিত।'
                  : '© 2026 NimeGami AI Anime Prompts Hub. All rights reserved.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6c5a52]">
            <a
              href="https://www.facebook.com/share/14tSwFz9SXh/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#1877F2] font-semibold hover:underline"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Page</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CopyAdModal />
      <PromptDetailModal />
      <GeminiPromptStudio />
      <QuickPostModal isOpen={isQuickPostOpen} onClose={() => setIsQuickPostOpen(false)} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2b231f] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-orange-300 animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <GalleryView />
    </AppProvider>
  );
}
