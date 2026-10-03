import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateAIPromptWithGemini } from '../services/gemini';
import { Sparkles, Copy, X, Loader2, Wand2, Plus } from 'lucide-react';
import { AIModel, AspectRatio } from '../types';

export const GeminiPromptStudio: React.FC = () => {
  const {
    isStudioOpen,
    setIsStudioOpen,
    language,
    handleRequestCopy,
    addPrompt,
    isAdminLoggedIn,
  } = useApp();

  const [concept, setConcept] = useState('');
  const [style, setStyle] = useState('Cinematic Photorealistic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    prompt: string;
    negativePrompt: string;
    model: string;
    tags: string[];
  } | null>(null);

  if (!isStudioOpen) return null;

  const isBn = language === 'bn';

  const styles = [
    'Cinematic Photorealistic',
    'Cyberpunk Neo-Noir',
    '3D Isometric Octane',
    'Editorial High Fashion',
    'Anime Makoto Shinkai',
    'Fantasy Mythological',
    'Minimalist Architecture',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setLoading(true);
    try {
      const data = await generateAIPromptWithGemini(concept, style);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToGallery = () => {
    if (!result) return;
    addPrompt({
      title: result.title,
      titleBn: isBn ? `${concept} (ইআই প্রম্পট)` : undefined,
      prompt: result.prompt,
      negativePrompt: result.negativePrompt,
      imageUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      model: (result.model as AIModel) || 'Midjourney v6',
      category: 'cyberpunk',
      aspectRatio: '4:3' as AspectRatio,
      tags: result.tags,
      seed: Math.floor(Math.random() * 90000000 + 10000000).toString(),
      cfgScale: 7.0,
      sampler: 'Euler a',
      isFeatured: false,
    });
    setIsStudioOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={() => setIsStudioOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'ইআই প্রম্পট স্টুডিও' : 'AI Master Prompt Studio'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'আপনার সাধারণ ধারণাকে প্রফেশনাল মিডজার্নি বা এসডিএক্সএল প্রম্পটে রূপান্তর করুন'
                  : 'Convert simple ideas into master-grade AI prompts powered by Gemini'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStudioOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isBn ? 'আপনার আইডিয়া বা বিষয় লিখুন:' : 'Describe your vision or subject:'}
            </label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={3}
              placeholder={
                isBn
                  ? 'উদাহরণ: নিয়ন আলোতে বৃষ্টিভেজা ঢাকার রিকশা, অথবা ড্রাগনের চোখের ম্যাক্রো শট...'
                  : 'e.g. A futuristic Bengal tiger with glowing neon stripes in rainy Neo-Tokyo...'
              }
              className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isBn ? 'স্টাইল বা ভিজ্যুয়াল ধরণ:' : 'Artistic Style:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {styles.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    style === s
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !concept.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isBn ? 'প্রম্পট জেনারেট হচ্ছে...' : 'Engineering Prompt...'}</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>{isBn ? 'মাস্টার প্রম্পট তৈরি করুন' : 'Generate Master Prompt'}</span>
              </>
            )}
          </button>
        </form>

        {/* Results Box */}
        {result && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">{result.title}</span>
              <span className="text-[11px] text-slate-400 font-mono">{result.model}</span>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 select-all leading-relaxed">
              {result.prompt}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleRequestCopy({
                    id: 'gen-prompt',
                    title: result.title,
                    prompt: result.prompt,
                    imageUrl: '',
                    model: 'Midjourney v6',
                    category: 'generated',
                    aspectRatio: '4:3',
                    tags: result.tags,
                    views: 1,
                    copyCount: 1,
                    likes: 0,
                    createdAt: new Date().toISOString(),
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                <Copy size={13} />
                <span>{isBn ? 'বিজ্ঞাপন দেখে কপি করুন' : 'Copy via Ad Wall'}</span>
              </button>

              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={handlePublishToGallery}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{isBn ? 'গ্যালারিতে পোস্ট করুন' : 'Add to Public Gallery'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
