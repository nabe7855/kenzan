
export interface Theme {
  id: string;
  title: string;
  totalSeconds: number;
  color: string;
  icon: string;
  createdAt: number;
}

export interface Session {
  id: string;
  themeId: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  note: string;
}

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
export type Gender = 'Male' | 'Female' | 'Other';
export type Region = 'Japan' | 'Asia' | 'NorthAmerica' | 'Europe' | 'Other';

export interface UserProfile {
  name: string;
  avatar: string;
  joinedAt: number;
  ageGroup?: AgeGroup;
  gender?: Gender;
  region?: Region;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export enum Rank {
  Beginner = "ビギナー",       // 0 - 100h
  Amateur = "アマチュア",         // 100 - 500h
  Intermediate = "中級者", // 500 - 1000h
  Advanced = "上級者",       // 1000 - 2500h
  Expert = "エキスパート",           // 2500 - 5000h
  Master = "マスター",           // 5000 - 7500h
  Legend = "レジェンド"            // 7500 - 10000h+
}

export const LEVEL_THRESHOLDS = {
  [Rank.Beginner]: 0,
  [Rank.Amateur]: 100 * 3600,
  [Rank.Intermediate]: 500 * 3600,
  [Rank.Advanced]: 1000 * 3600,
  [Rank.Expert]: 2500 * 3600,
  [Rank.Master]: 5000 * 3600,
  [Rank.Legend]: 7500 * 3600,
};

// --- Journal Types ---

export type JournalFramework = 'free' | 'kpt' | 'ywt' | '4line' | 'thankful';

export type Mood = 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface JournalEntry {
  id: string;
  createdAt: number;
  updatedAt: number;
  mood: Mood;
  framework: JournalFramework;
  content: string; // 自由記述またはまとめ
  structuredContent: Record<string, string>; // フレームワークごとの各項目
  images: string[];
  tags: string[];
}

// --- Goal & Mindmap Types ---

// 階層構造: Major -> Medium -> Small -> Action
export type NodeType = 'major' | 'medium' | 'small' | 'action';

export interface GoalNode {
  id: string;
  parentId: string | null;
  themeId?: string; // Root (Major) nodes should have a themeId
  title: string;
  type: NodeType;
  description?: string;
  trigger?: string; // Only for 'action' type
  children: GoalNode[];
  createdAt: number;
}

export interface SharpenLog {
  id: string;
  nodeId: string; // ID of the action node
  nodeTitle: string;
  timestamp: number;
}

// --- Grinding (KENSAN) Types ---

export interface SlashLog {
  id: string;
  userId: string;
  durationSec: number;
  earnedTGI: number;
  executedAt: number;
  rankBefore: number;
  rankAfter: number;
  overtakenCount: number;
}

export interface GrindingStats {
  userId: string;
  totalTGI: number;
  currentRank: number;
  lastSlashedAt: number;
  bestRank: number;
}

// --- Blog Types ---

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Simple HTML/Markdown supported
  category: 'Mindset' | 'Technique' | 'Science' | 'Story';
  readTime: string;
  imageUrl?: string;
  publishedAt: number;
}