import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Sparkles, Image as ImageIcon, Send, Check, RefreshCw } from 'lucide-react';
import { AIModel, AspectRatio } from '../types';
import { generateAIPromptWithGemini } from '../services/gemini';
import { compressImage } from '../services/imageCompressor';

export const QuickPostModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addPrompt, language, showToast } = useApp();

  const [imageUrl, setImageUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [model, setModel] = useState<AIModel>('Midjourney v6');
  const [category, setCategory] = useState('cyberpunk');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const isBn = language === 'bn';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedDataUrl = await compressImage(file, 1280, 1280, 0.85);
        setImageUrl(compressedDataUrl);
        showToast(isBn ? '✓ ছবি অপটিমাইজ ও লোড সম্পন্ন হয়েছে!' : '✓ Image ready!');
      } catch (err) {
        console.error('Failed to compress image', err);
        showToast(isBn ? 'ছবি লোড করতে সমস্যা হয়েছে' : 'Failed to process image file');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleAutoFillWithAi = async () => {
    if (!promptText.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await generateAIPromptWithGemini(promptText, 'Ultra Realistic');
      setTitleText(res.title);
      setPromptText(res.prompt);
      showToast(isBn ? '✓ জেমিনাই দিয়ে প্রম্পট ও টাইটেল অটোমেটিক সাজানো হয়েছে!' : '✓ Auto-generated with Gemini AI!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsPublishing(true);

    try {
      const finalImg =
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

      await addPrompt({
        title: titleText.trim() || 'Quick AI Post',
        titleBn: isBn ? (titleText.trim() || 'দ্রুত এআই পোস্ট') : '',
        prompt: promptText.trim(),
        imageUrl: finalImg,
        model,
        category,
        aspectRatio: '4:3' as AspectRatio,
        tags: ['QuickPost', model, category],
        isFeatured: true,
      });

      onClose();
      setImageUrl('');
      setPromptText('');
      setTitleText('');
    } catch (err) {
      console.error('Failed to publish', err);
      showToast(isBn ? 'পাবলিশ করতে সমস্যা হয়েছে' : 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#111827] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Send size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBn ? '১-ক্লিক দ্রুত পোস্ট (Quick Post)' : '1-Click Quick Post'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'সহজেই ফটো সিলেক্ট করুন এবং এক ক্লিকে প্রম্পটসহ সাইটে পোস্ট করুন'
                  : 'Fast upload photo and prompt to display live on site'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isBn ? 'ফটো নির্বাচন করুন:' : 'Select Photo:'}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors">
                <Upload size={14} className="text-amber-400" />
                <span>{isBn ? 'ডিভাইস থেকে ফাইল নিন' : 'Choose File...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={isBn ? 'অথবা ফটোর URL লিঙ্ক দিন...' : 'or paste Image URL...'}
                className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Image Preview if available */}
          {imageUrl && (
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          {/* AI Prompt Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBn ? 'এআই প্রম্পট লিখুন:' : 'AI Prompt:'}
              </label>
              <button
                type="button"
                onClick={handleAutoFillWithAi}
                disabled={isAiGenerating || !promptText.trim()}
                className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={12} className={isAiGenerating ? 'animate-spin' : ''} />
                <span>{isBn ? 'এআই দিয়ে প্রম্পট সাজান' : 'Auto Enhance'}</span>
              </button>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              placeholder={
                isBn
                  ? 'যেমন: নিয়ন আলোতে চমৎকার রয়েল বেঙ্গল টাইগার, অতি বাস্তব ৮কে...'
                  : 'e.g. Cyberpunk tiger with glowing blue fiber optics, 8k resolution --ar 4:3'
              }
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              required
            />
          </div>

          {/* AI Engine & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                AI Engine:
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as AIModel)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              >
                <option value="Midjourney v6">Midjourney v6</option>
                <option value="Flux.1 Schnell">Flux.1 Schnell</option>
                <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                <option value="DALL-E 3">DALL-E 3</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white capitalize"
              >
                <option value="cyberpunk">Cyberpunk</option>
                <option value="portrait">Portrait</option>
                <option value="3d-render">3D Render</option>
                <option value="fantasy">Fantasy</option>
                <option value="architecture">Architecture</option>
              </select>
            </div>
          </div>

          {/* 1-Click Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-98"
          >
            <Send size={15} />
            <span>{isBn ? '১-ক্লিকে ওয়েবসাইটে পোস্ট করুন' : '1-Click Publish Live'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
