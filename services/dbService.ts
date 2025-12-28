import { supabase } from './supabase';
import {
    Theme, Session, JournalEntry, GoalNode, SharpenLog,
    UserProfile, GrindingStats, SlashLog
} from '../types';

export const dbService = {
    // --- Profiles ---
    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return {
            name: data.name,
            avatar: data.avatar_url,
            joinedAt: new Date(data.joined_at).getTime(),
            ageGroup: data.age_group,
            gender: data.gender,
            region: data.region
        };
    },

    async updateProfile(userId: string, profile: Partial<UserProfile>) {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                name: profile.name,
                avatar_url: profile.avatar,
                age_group: profile.ageGroup,
                gender: profile.gender,
                region: profile.region
            });

        if (error) console.error('Error updating profile:', error);
    },

    // --- Themes ---
    async getThemes(userId: string): Promise<Theme[]> {
        const { data, error } = await supabase
            .from('themes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching themes:', error);
            return [];
        }
        return data.map(t => ({
            id: t.id,
            title: t.title,
            color: t.color,
            icon: t.icon,
            totalSeconds: parseInt(t.total_seconds),
            createdAt: new Date(t.created_at).getTime()
        }));
    },

    async saveTheme(userId: string, theme: Theme) {
        const { error } = await supabase
            .from('themes')
            .upsert({
                id: theme.id,
                user_id: userId,
                title: theme.title,
                color: theme.color,
                icon: theme.icon,
                total_seconds: theme.totalSeconds,
                created_at: new Date(theme.createdAt).toISOString()
            });

        if (error) console.error('Error saving theme:', error);
    },

    // --- Sessions ---
    async getSessions(userId: string): Promise<Session[]> {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .order('end_time', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
        return data.map(s => ({
            id: s.id,
            themeId: s.theme_id,
            startTime: new Date(s.start_time).getTime(),
            endTime: new Date(s.end_time).getTime(),
            durationSeconds: s.duration_seconds,
            note: s.note
        }));
    },

    async saveSession(userId: string, session: Session) {
        const { error } = await supabase
            .from('sessions')
            .insert({
                id: session.id,
                user_id: userId,
                theme_id: session.themeId,
                start_time: new Date(session.startTime).toISOString(),
                end_time: new Date(session.endTime).toISOString(),
                duration_seconds: session.durationSeconds,
                note: session.note
            });

        if (error) console.error('Error saving session:', error);
    },

    // --- Journal ---
    async getJournalEntries(userId: string): Promise<JournalEntry[]> {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching journal:', error);
            return [];
        }
        return data.map(j => ({
            id: j.id,
            createdAt: new Date(j.created_at).getTime(),
            updatedAt: new Date(j.updated_at).getTime(),
            mood: j.mood,
            framework: j.framework,
            content: j.content,
            structuredContent: j.structured_content,
            images: j.images || [],
            tags: j.tags || []
        }));
    },

    async saveJournalEntry(userId: string, entry: JournalEntry) {
        const { error } = await supabase
            .from('journal_entries')
            .upsert({
                id: entry.id,
                user_id: userId,
                created_at: new Date(entry.createdAt).toISOString(),
                updated_at: new Date(entry.updatedAt).toISOString(),
                mood: entry.mood,
                framework: entry.framework,
                content: entry.content,
                structured_content: entry.structuredContent,
                images: entry.images,
                tags: entry.tags
            });

        if (error) console.error('Error saving journal:', error);
    },

    // --- Goals ---
    async getGoals(userId: string): Promise<GoalNode[]> {
        const { data, error } = await supabase
            .from('goal_nodes')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching goals:', error);
            return [];
        }

        // Build hierarchical tree
        const buildTree = (parentId: string | null): GoalNode[] => {
            return data
                .filter(node => node.parent_id === parentId)
                .map(node => ({
                    id: node.id,
                    parentId: node.parent_id,
                    themeId: node.theme_id,
                    title: node.title,
                    type: node.type,
                    description: node.description,
                    trigger: node.trigger,
                    createdAt: new Date(node.created_at).getTime(),
                    children: buildTree(node.id)
                }));
        };

        return buildTree(null);
    },

    async saveGoal(userId: string, node: GoalNode) {
        // Note: This only saves one node. Hierarchical saving needs recursion or separate calls.
        const { error } = await supabase
            .from('goal_nodes')
            .upsert({
                id: node.id,
                user_id: userId,
                parent_id: node.parentId,
                theme_id: node.themeId,
                title: node.title,
                type: node.type,
                description: node.description,
                trigger: node.trigger,
                created_at: new Date(node.createdAt).toISOString()
            });

        if (error) console.error('Error saving goal node:', error);

        // Recursively save children
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                await this.saveGoal(userId, child);
            }
        }
    },

    // --- Sharpen Logs ---
    async getSharpenLogs(userId: string): Promise<SharpenLog[]> {
        const { data, error } = await supabase
            .from('sharpen_logs')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching sharpen logs:', error);
            return [];
        }
        return data.map(l => ({
            id: l.id,
            nodeId: l.node_id,
            nodeTitle: l.node_title,
            timestamp: new Date(l.timestamp).getTime()
        }));
    },

    async saveSharpenLog(userId: string, log: SharpenLog) {
        const { error } = await supabase
            .from('sharpen_logs')
            .insert({
                id: log.id,
                user_id: userId,
                node_id: log.nodeId,
                node_title: log.nodeTitle,
                timestamp: new Date(log.timestamp).toISOString()
            });

        if (error) console.error('Error saving sharpen log:', error);
    },

    // --- Grinding Stats ---
    async getGrindingStats(userId: string): Promise<GrindingStats | null> {
        const { data, error } = await supabase
            .from('grinding_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') console.error('Error fetching grinding stats:', error);
            return null;
        }
        return {
            userId: data.user_id,
            totalTGI: parseInt(data.total_tgi),
            currentRank: data.current_rank,
            lastSlashedAt: data.last_slashed_at ? new Date(data.last_slashed_at).getTime() : 0,
            bestRank: data.best_rank
        };
    },

    async saveGrindingStats(stats: GrindingStats) {
        const { error } = await supabase
            .from('grinding_stats')
            .upsert({
                user_id: stats.userId,
                total_tgi: stats.totalTGI,
                current_rank: stats.currentRank,
                last_slashed_at: stats.lastSlashedAt ? new Date(stats.lastSlashedAt).toISOString() : null,
                best_rank: stats.bestRank
            });

        if (error) console.error('Error saving grinding stats:', error);
    },

    // --- Slash Logs ---
    async getSlashLogs(userId: string): Promise<SlashLog[]> {
        const { data, error } = await supabase
            .from('slash_logs')
            .select('*')
            .eq('user_id', userId)
            .order('executed_at', { ascending: false });

        if (error) {
            console.error('Error fetching slash logs:', error);
            return [];
        }
        return data.map(l => ({
            id: l.id,
            userId: l.user_id,
            durationSec: l.duration_sec,
            earnedTGI: l.earned_tgi,
            executedAt: new Date(l.executed_at).getTime(),
            rankBefore: l.rank_before,
            rankAfter: l.rank_after,
            overtakenCount: l.overtaken_count
        }));
    },

    async saveSlashLog(userId: string, log: SlashLog) {
        const { error } = await supabase
            .from('slash_logs')
            .insert({
                id: log.id,
                user_id: userId,
                duration_sec: log.durationSec,
                earned_tgi: log.earnedTGI,
                executed_at: new Date(log.executedAt).toISOString(),
                rank_before: log.rankBefore,
                rank_after: log.rankAfter,
                overtaken_count: log.overtakenCount
            });

        if (error) console.error('Error saving slash log:', error);
    }
};
