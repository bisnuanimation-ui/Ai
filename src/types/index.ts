export type AIModel = 
  | 'Midjourney v6'
  | 'Niji Journey v6'
  | 'Flux.1 Schnell'
  | 'Stable Diffusion XL'
  | 'DALL-E 3'
  | 'Google Imagen 3'
  | 'Leonardo Phoenix';

export type AspectRatio = '1:1' | '16:9' | '4:3' | '9:16' | '3:2' | '2:3';

export interface PromptItem {
  id: string;
  title: string;
  titleBn?: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  model: AIModel;
  category: string;
  aspectRatio: AspectRatio;
  tags: string[];
  seed?: string;
  cfgScale?: number;
  sampler?: string;
  views: number;
  copyCount: number;
  likes: number;
  isFeatured?: boolean;
  createdAt: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  sponsorName: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  buttonText: string;
  badgeText: string;
  active: boolean;
  cpmRate: number; // e.g., $4.50 per 1000 impressions
  cpcRate: number; // e.g., $0.35 per click
}

export interface AdSettings {
  adWallEnabled: boolean;
  countdownSeconds: number; // 0 to 10
  allowInstantSkip: boolean;
  activeCampaignId: string;
  showInFeedBanners: boolean;
  bannerFrequency: number; // Every N cards
  adNetworkMode: 'custom' | 'adsense_simulated' | 'hybrid';
  adsensePublisherId: string;
}

export interface AdAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalCopies: number;
  estimatedEarningsUsd: number;
  dailyStats: {
    date: string;
    impressions: number;
    clicks: number;
    copies: number;
    earnings: number;
  }[];
}

export type Language = 'bn' | 'en';
