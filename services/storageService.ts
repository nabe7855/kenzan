
import { Theme, Session, UserProfile, JournalEntry, GoalNode, SharpenLog, AuthUser, SlashLog, GrindingStats } from '../types';
import { INITIAL_THEMES } from '../constants';

const KEYS = {
  THEMES: '10k_themes',
  SESSIONS: '10k_sessions',
  PROFILE: '10k_profile',
  JOURNAL: '10k_journal',
  GOALS: '10k_goals',
  SHARPEN_LOGS: '10k_sharpen_logs',
  AUTH_USER: '10k_auth_user',
  SLASH_LOGS: '10k_slash_logs',
  GRINDING_STATS: '10k_grinding_stats',
};

export const storageService = {
  getThemes: (): Theme[] => {
    try {
      const data = localStorage.getItem(KEYS.THEMES);
      return data ? JSON.parse(data) : INITIAL_THEMES;
    } catch {
      return INITIAL_THEMES;
    }
  },

  saveThemes: (themes: Theme[]) => {
    localStorage.setItem(KEYS.THEMES, JSON.stringify(themes));
  },

  getSessions: (): Session[] => {
    try {
      const data = localStorage.getItem(KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSession: (session: Session) => {
    const sessions = storageService.getSessions();
    sessions.unshift(session); // Add to top
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      const defaultProfile: UserProfile = { 
        name: 'ゲストユーザー', 
        avatar: '', 
        joinedAt: Date.now(),
        // Default values won't be set initially to prompt user
      };
      return data ? { ...defaultProfile, ...JSON.parse(data) } : defaultProfile;
    } catch {
      return { name: 'ゲストユーザー', avatar: '', joinedAt: Date.now() };
    }
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  // --- Auth User ---
  getCurrentUser: (): AuthUser | null => {
    try {
      const data = localStorage.getItem(KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCurrentUser: (user: AuthUser) => {
    localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
  },

  removeCurrentUser: () => {
    localStorage.removeItem(KEYS.AUTH_USER);
  },

  // --- Journal ---
  getJournalEntries: (): JournalEntry[] => {
    try {
      const data = localStorage.getItem(KEYS.JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveJournalEntry: (entry: JournalEntry) => {
    const entries = storageService.getJournalEntries();
    // Check if update or new
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.unshift(entry);
    }
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(entries));
  },

  deleteJournalEntry: (id: string) => {
    const entries = storageService.getJournalEntries();
    const newEntries = entries.filter(e => e.id !== id);
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(newEntries));
  },

  // --- Goals & Sharpen Logs ---
  getGoals: (): GoalNode[] => {
    try {
      const data = localStorage.getItem(KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveGoals: (goals: GoalNode[]) => {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  getSharpenLogs: (): SharpenLog[] => {
    try {
      const data = localStorage.getItem(KEYS.SHARPEN_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSharpenLog: (log: SharpenLog) => {
    const logs = storageService.getSharpenLogs();
    logs.unshift(log);
    localStorage.setItem(KEYS.SHARPEN_LOGS, JSON.stringify(logs));
  },

  // --- Grinding (KENSAN) ---
  getSlashLogs: (): SlashLog[] => {
    try {
      const data = localStorage.getItem(KEYS.SLASH_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSlashLog: (log: SlashLog) => {
    const logs = storageService.getSlashLogs();
    logs.unshift(log);
    localStorage.setItem(KEYS.SLASH_LOGS, JSON.stringify(logs));
  },

  getGrindingStats: (userId: string): GrindingStats => {
    try {
      const data = localStorage.getItem(KEYS.GRINDING_STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    // Default
    return {
      userId,
      totalTGI: 0,
      currentRank: 8232000000,
      lastSlashedAt: 0,
      bestRank: 8232000000
    };
  },

  saveGrindingStats: (stats: GrindingStats) => {
    localStorage.setItem(KEYS.GRINDING_STATS, JSON.stringify(stats));
  }
};