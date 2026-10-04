import React, { createContext, useContext, useState, useEffect } from 'react';
import { PromptItem, AdCampaign, AdSettings, AdAnalytics, Language } from '../types';
import { storage } from '../services/storage';
import { firestoreService } from '../services/firebase';
import { copyToClipboard } from '../utils/clipboard';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  prompts: PromptItem[];
  categories: { id: string; nameEn: string; nameBn: string }[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  
  // Modals & States
  activePromptDetail: PromptItem | null;
  setActivePromptDetail: (prompt: PromptItem | null) => void;
  copyModalPrompt: PromptItem | null;
  setCopyModalPrompt: (prompt: PromptItem | null) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (logged: boolean) => void;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  isQuickPostOpen: boolean;
  setIsQuickPostOpen: (open: boolean) => void;

  // Liked items
  likedPromptIds: string[];
  toggleLike: (promptId: string) => void;

  // Copy flow
  handleRequestCopy: (prompt: PromptItem) => void;
  finalizeCopy: (prompt: PromptItem) => Promise<boolean>;

  // Admin actions
  addPrompt: (newPrompt: Omit<PromptItem, 'id' | 'views' | 'copyCount' | 'likes' | 'createdAt'>) => Promise<void> | void;
  updatePrompt: (prompt: PromptItem) => Promise<void> | void;
  deletePrompt: (promptId: string) => Promise<void> | void;
  toggleFeatured: (promptId: string) => void;
  
  // Ad & Settings
  adSettings: AdSettings;
  updateAdSettings: (settings: AdSettings) => void;
  adCampaigns: AdCampaign[];
  updateAdCampaigns: (campaigns: AdCampaign[]) => void;
  analytics: AdAnalytics;
  onAdClick: (campaign?: AdCampaign) => void;
  onAdImpression: (campaign?: AdCampaign) => void;
  resetAll: () => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');
  const [prompts, setPrompts] = useState<PromptItem[]>(() => storage.getPrompts());
  const [categories, setCategories] = useState(() => storage.getCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  
  const [activePromptDetail, setActivePromptDetail] = useState<PromptItem | null>(null);
  const [copyModalPrompt, setCopyModalPrompt] = useState<PromptItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [isQuickPostOpen, setIsQuickPostOpen] = useState<boolean>(false);

  const [likedPromptIds, setLikedPromptIds] = useState<string[]>(() => storage.getLikedPrompts());
  const [adSettings, setAdSettings] = useState<AdSettings>(() => storage.getAdSettings());
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(() => storage.getAdCampaigns());
  const [analytics, setAnalytics] = useState<AdAnalytics>(() => storage.getAnalytics());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Sync with Firestore & Server
  useEffect(() => {
    let isMounted = true;

    // 1. Seed Firestore if empty
    firestoreService.seedInitialPrompts(prompts);

    // 2. Realtime Firestore Listener (instant live sync across all devices)
    const unsubscribeFirestore = firestoreService.subscribeToPrompts((livePrompts) => {
      if (isMounted && livePrompts && livePrompts.length > 0) {
        setPrompts(livePrompts);
        storage.savePrompts(livePrompts);
      }
    });

    // 3. Fallback server polling (safely merges without erasing newest client/cloud items)
    const fetchPromptsFromServer = async () => {
      try {
        const res = await fetch('/api/prompts');
        if (res.ok) {
          const serverData = await res.json();
          if (Array.isArray(serverData) && serverData.length > 0 && isMounted) {
            setPrompts((current) => {
              const currentIds = new Set(current.map((p) => p.id));
              const newItems = serverData.filter((p: PromptItem) => !currentIds.has(p.id));
              if (newItems.length === 0) return current;
              const merged = [...current, ...newItems];
              storage.savePrompts(merged);
              return merged;
            });
          }
        }
      } catch (err) {
        // Fallback to local
      }
    };

    const interval = setInterval(fetchPromptsFromServer, 10000);

    return () => {
      isMounted = false;
      unsubscribeFirestore();
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Toggle like
  const toggleLike = (promptId: string) => {
    const res = storage.toggleLikePrompt(promptId);
    setLikedPromptIds(storage.getLikedPrompts());
    setPrompts((prev) =>
      prev.map((p) => (p.id === promptId ? { ...p, likes: res.count } : p))
    );
  };

  // Trigger copy prompt
  const handleRequestCopy = (prompt: PromptItem) => {
    if (adSettings.adWallEnabled) {
      // Open the Ad modal as requested by user! ("সে ফ্রম কপি করতে গেলে অ্যাড দেখাবে")
      setCopyModalPrompt(prompt);
      // Track impression
      const activeCamp = adCampaigns.find((c) => c.id === adSettings.activeCampaignId) || adCampaigns[0];
      const newAnalytics = storage.recordAdImpression(activeCamp?.cpmRate || 5.0);
      setAnalytics({ ...newAnalytics });
    } else {
      // Direct copy if ad wall disabled by admin
      finalizeCopy(prompt);
    }
  };

  // Finalize copy to clipboard
  const finalizeCopy = async (prompt: PromptItem): Promise<boolean> => {
    try {
      const copySuccess = await copyToClipboard(prompt.prompt);

      const res = storage.recordPromptCopy(prompt.id);
      setAnalytics({ ...res.analytics });
      setPrompts([...res.prompts]);
      
      const successMsg = language === 'bn' 
        ? '✓ প্রম্পট ক্লিপবোর্ডে কপি করা হয়েছে!' 
        : '✓ Prompt copied to clipboard successfully!';
      showToast(successMsg);
      return copySuccess;
    } catch (err) {
      console.warn('Clipboard notice:', err);
      showToast(language === 'bn' ? '✓ প্রম্পট কপি সম্পন্ন!' : '✓ Prompt copied!');
      return true;
    }
  };

  // Record ad click
  const onAdClick = (campaign?: AdCampaign) => {
    const camp = campaign || adCampaigns.find((c) => c.id === adSettings.activeCampaignId);
    const newAnalytics = storage.recordAdClick(camp?.cpcRate || 0.4);
    setAnalytics({ ...newAnalytics });
  };

  const onAdImpression = (campaign?: AdCampaign) => {
    const camp = campaign || adCampaigns.find((c) => c.id === adSettings.activeCampaignId);
    const newAnalytics = storage.recordAdImpression(camp?.cpmRate || 5.0);
    setAnalytics({ ...newAnalytics });
  };

  // Helper to upload image if it's base64 data URL
  const uploadImageIfNeeded = async (imgUrl: string): Promise<string> => {
    if (imgUrl && imgUrl.startsWith('data:image/')) {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imgUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) return data.url;
        }
      } catch (err) {
        console.warn('Failed to upload image to server, using data URL fallback', err);
      }
    }
    return imgUrl;
  };

  // Admin add prompt (Live synced to server & cloud database)
  const addPrompt = async (newPromptData: Omit<PromptItem, 'id' | 'views' | 'copyCount' | 'likes' | 'createdAt'>) => {
    const finalImageUrl = newPromptData.imageUrl;
    
    // Also backup upload to server if base64 (without overwriting data URL)
    if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
      try {
        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalImageUrl }),
        }).catch(() => {});
      } catch (err) {
        // ignore
      }
    }

    const newId = `prompt-${Date.now()}`;
    const newItem: PromptItem = {
      ...newPromptData,
      imageUrl: finalImageUrl,
      id: newId,
      views: 1,
      copyCount: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    const updated = [newItem, ...prompts.filter(p => p.id !== newId)];
    setPrompts(updated);
    storage.savePrompts(updated);

    // Save to Firestore & Realtime Database
    try {
      await firestoreService.savePrompt(newItem);
    } catch (fsErr) {
      console.error('Firebase save error:', fsErr);
    }

    // Save to persistent server API
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch (err) {
      console.warn('Server sync error on add prompt', err);
    }

    showToast(language === 'bn' ? '✓ নতুন প্রম্পট ও ছবি সফলভাবে পাবলিশ হয়েছে!' : '✓ New AI prompt published successfully!');
  };

  const updatePrompt = async (updatedPrompt: PromptItem) => {
    const finalImageUrl = updatedPrompt.imageUrl;

    if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
      try {
        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalImageUrl }),
        }).catch(() => {});
      } catch (e) {}
    }

    const itemToSave = { ...updatedPrompt, imageUrl: finalImageUrl };

    const updated = prompts.map((p) => (p.id === itemToSave.id ? itemToSave : p));
    setPrompts(updated);
    storage.savePrompts(updated);

    if (activePromptDetail?.id === itemToSave.id) {
      setActivePromptDetail(itemToSave);
    }

    // Save to Firestore & Realtime Database
    try {
      await firestoreService.savePrompt(itemToSave);
    } catch (fsErr) {
      console.error('Firebase update error:', fsErr);
    }

    // Save to server
    try {
      await fetch(`/api/prompts/${itemToSave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemToSave),
      });
    } catch (err) {
      console.warn('Server sync error on update', err);
    }

    showToast(language === 'bn' ? '✓ প্রম্পট আপডেট হয়েছে' : '✓ Prompt updated');
  };

  const deletePrompt = async (promptId: string) => {
    const updated = prompts.filter((p) => p.id !== promptId);
    setPrompts(updated);
    storage.savePrompts(updated);

    if (activePromptDetail?.id === promptId) {
      setActivePromptDetail(null);
    }

    // Delete from Firestore & Realtime Database
    try {
      await firestoreService.deletePrompt(promptId);
    } catch (fsErr) {
      console.error('Firebase delete error:', fsErr);
    }

    // Delete from server
    try {
      await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Server sync error on delete', err);
    }

    showToast(language === 'bn' ? 'প্রম্পট মুছে ফেলা হয়েছে' : 'Prompt deleted');
  };

  const toggleFeatured = (promptId: string) => {
    const updated = prompts.map((p) =>
      p.id === promptId ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setPrompts(updated);
    storage.savePrompts(updated);
  };

  const updateAdSettings = (newSettings: AdSettings) => {
    setAdSettings(newSettings);
    storage.saveAdSettings(newSettings);
    showToast(language === 'bn' ? '✓ অ্যাড সেটিংস সংরক্ষিত হয়েছে' : '✓ Ad settings saved');
  };

  const updateAdCampaigns = (newCampaigns: AdCampaign[]) => {
    setAdCampaigns(newCampaigns);
    storage.saveAdCampaigns(newCampaigns);
    showToast(language === 'bn' ? '✓ বিজ্ঞাপন ক্যাম্পেইন আপডেট হয়েছে' : '✓ Ad campaigns updated');
  };

  const resetAll = () => {
    storage.resetAllData();
    setPrompts(storage.getPrompts());
    setAdSettings(storage.getAdSettings());
    setAdCampaigns(storage.getAdCampaigns());
    setAnalytics(storage.getAnalytics());
    setCategories(storage.getCategories());
    showToast(language === 'bn' ? 'ডিফল্ট ডেটায় রিসেট সম্পন্ন' : 'Reset to default data');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        prompts,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedModel,
        setSelectedModel,
        activePromptDetail,
        setActivePromptDetail,
        copyModalPrompt,
        setCopyModalPrompt,
        isAdminOpen,
        setIsAdminOpen,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isStudioOpen,
        setIsStudioOpen,
        isQuickPostOpen,
        setIsQuickPostOpen,
        likedPromptIds,
        toggleLike,
        handleRequestCopy,
        finalizeCopy,
        addPrompt,
        updatePrompt,
        deletePrompt,
        toggleFeatured,
        adSettings,
        updateAdSettings,
        adCampaigns,
        updateAdCampaigns,
        analytics,
        onAdClick,
        onAdImpression,
        resetAll,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
