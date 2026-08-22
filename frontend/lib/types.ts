// Shared TypeScript types for Epsigate Photography

export type Category =
  | "Tous"
  | "Mariage"
  | "Mode"
  | "Portrait"
  | "Événementiel"
  | "Commercial"
  | "Studio";

export interface PortfolioItem {
  id: number;
  title: string;
  category: Category;
  src: string;
  description: string;
  featured?: boolean;
  createdAt?: string;
}

export type MessageStatus = "nouveau" | "traité" | "archivé";

export interface MessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  service: string;
  date?: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  badge: string;
  image: string;
  description: string;
  advantages: string[];
  price: string;
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  bio: string;
  photo?: string;
  createdAt?: string;
}

export interface SiteSettings {
  studioName: string;
  tagline: string;
  address: string;
  zone: string;
  phone: string;
  whatsapp: string;
  email: string;
  weekdayHours: string;
  saturdayHours: string;
  responseDelay: string;
  heroHeadline: string;
  heroSubtitle: string;
  aboutStory: string;
  mapEmbedUrl?: string;
  googleMapsLink?: string;
}

export interface SiteStats {
  monthlyVisits: number;
  totalQuotes: number;
  responseRatePercent: number;
  activeProjects: number;
  trafficHistory: { month: string; visits: number; inquiries: number }[];
  categoryBreakdown: { category: string; count: number }[];
}
