import { PromptItem, AdCampaign, AdSettings, AdAnalytics } from '../types';
import {
  INITIAL_PROMPTS,
  INITIAL_AD_CAMPAIGNS,
  INITIAL_AD_SETTINGS,
  INITIAL_ANALYTICS,
  INITIAL_CATEGORIES,
} from '../data/initialData';

const STORAGE_KEYS = {
  PROMPTS: 'promptverse_prompts_v1',
  AD_SETTINGS: 'promptverse_ad_settings_v1',
  AD_CAMPAIGNS: 'promptverse_ad_campaigns_v1',
  ANALYTICS: 'promptverse_analytics_v1',
  CATEGORIES: 'promptverse_categories_v1',
  ADMIN_AUTH: 'promptverse_admin_auth_v1',
  LANGUAGE: 'promptverse_language_v1',
  LIKED_PROMPTS: 'promptverse_liked_prompts_v1',
};

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Handle QuotaExceededError gracefully
    try {
      // Clear non-critical or legacy cache keys
      const keysToClear = ['promptverse_analytics_v1', 'promptverse_ad_campaigns_v1'];
      for (const k of keysToClear) {
        if (k !== key) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
};

export const storage = {
  getPrompts: (): PromptItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      return data ? JSON.parse(data) : INITIAL_PROMPTS;
    } catch {
      return INITIAL_PROMPTS;
    }
  },

  savePrompts: (prompts: PromptItem[]) => {
    try {
      const serialized = JSON.stringify(prompts);
      if (safeSetItem(STORAGE_KEYS.PROMPTS, serialized)) {
        return;
      }
      
      // Fallback: If quota exceeded, sanitize large base64 data URLs for local storage
      const fallbackUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
      const lightweight = prompts.map((p) => {
        if (p.imageUrl && p.imageUrl.length > 50000) {
          return { ...p, imageUrl: fallbackUrl };
        }
        return p;
      });
      if (safeSetItem(STORAGE_KEYS.PROMPTS, JSON.stringify(lightweight))) {
        return;
      }

      // Final fallback: store only the latest 10 items
      safeSetItem(STORAGE_KEYS.PROMPTS, JSON.stringify(lightweight.slice(0, 10)));
    } catch (e) {
      // Graceful degradation - Firestore & Server handle full persistence
    }
  },

  getCategories: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories: (categories: typeof INITIAL_CATEGORIES) => {
    safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getAdSettings: (): AdSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AD_SETTINGS);
      return data ? JSON.parse(data) : INITIAL_AD_SETTINGS;
    } catch {
      return INITIAL_AD_SETTINGS;
    }
  },

  saveAdSettings: (settings: AdSettings) => {
    safeSetItem(STORAGE_KEYS.AD_SETTINGS, JSON.stringify(settings));
  },

  getAdCampaigns: (): AdCampaign[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AD_CAMPAIGNS);
      return data ? JSON.parse(data) : INITIAL_AD_CAMPAIGNS;
    } catch {
      return INITIAL_AD_CAMPAIGNS;
    }
  },

  saveAdCampaigns: (campaigns: AdCampaign[]) => {
    safeSetItem(STORAGE_KEYS.AD_CAMPAIGNS, JSON.stringify(campaigns));
  },

  getAnalytics: (): AdAnalytics => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      return data ? JSON.parse(data) : INITIAL_ANALYTICS;
    } catch {
      return INITIAL_ANALYTICS;
    }
  },

  saveAnalytics: (analytics: AdAnalytics) => {
    safeSetItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  },

  recordAdImpression: (cpmRate: number = 5.0) => {
    const analytics = storage.getAnalytics();
    analytics.totalImpressions += 1;
    analytics.estimatedEarningsUsd += Number((cpmRate / 1000).toFixed(4));
    storage.saveAnalytics(analytics);
    return analytics;
  },

  recordAdClick: (cpcRate: number = 0.4) => {
    const analytics = storage.getAnalytics();
    analytics.totalClicks += 1;
    analytics.estimatedEarningsUsd += Number(cpcRate.toFixed(3));
    storage.saveAnalytics(analytics);
    return analytics;
  },

  recordPromptCopy: (promptId: string) => {
    const analytics = storage.getAnalytics();
    analytics.totalCopies += 1;
    storage.saveAnalytics(analytics);

    const prompts = storage.getPrompts();
    const index = prompts.findIndex((p) => p.id === promptId);
    if (index !== -1) {
      prompts[index].copyCount += 1;
      storage.savePrompts(prompts);
    }
    return { analytics, prompts };
  },

  getLikedPrompts: (): string[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_PROMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleLikePrompt: (promptId: string): { liked: boolean; count: number } => {
    const liked = storage.getLikedPrompts();
    const isLiked = liked.includes(promptId);
    const newLiked = isLiked ? liked.filter((id) => id !== promptId) : [...liked, promptId];
    safeSetItem(STORAGE_KEYS.LIKED_PROMPTS, JSON.stringify(newLiked));

    const prompts = storage.getPrompts();
    const item = prompts.find((p) => p.id === promptId);
    let count = item?.likes || 0;
    if (item) {
      item.likes = isLiked ? Math.max(0, item.likes - 1) : item.likes + 1;
      count = item.likes;
      storage.savePrompts(prompts);
    }

    return { liked: !isLiked, count };
  },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.PROMPTS);
    localStorage.removeItem(STORAGE_KEYS.AD_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AD_CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  },
};
