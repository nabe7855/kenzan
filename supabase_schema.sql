-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar_url TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    age_group TEXT,
    gender TEXT,
    region TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Themes Table
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    total_seconds BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own themes" ON public.themes
    FOR ALL USING (auth.uid() = user_id);

-- 3. Sessions Table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_seconds INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions" ON public.sessions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Journal Entries Table
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    mood TEXT,
    framework TEXT,
    content TEXT,
    structured_content JSONB,
    images TEXT[],
    tags TEXT[]
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journal entries" ON public.journal_entries
    FOR ALL USING (auth.uid() = user_id);

-- 5. Goal Nodes Table
CREATE TABLE public.goal_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.goal_nodes(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES public.themes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('major', 'medium', 'small', 'action')),
    description TEXT,
    trigger TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goal_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goal nodes" ON public.goal_nodes
    FOR ALL USING (auth.uid() = user_id);

-- 6. Sharpen Logs Table
CREATE TABLE public.sharpen_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    node_id UUID REFERENCES public.goal_nodes(id) ON DELETE SET NULL,
    node_title TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sharpen_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sharpen logs" ON public.sharpen_logs
    FOR ALL USING (auth.uid() = user_id);

-- 7. Grinding Stats Table
CREATE TABLE public.grinding_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_tgi BIGINT DEFAULT 0,
    current_rank INTEGER DEFAULT 1,
    last_slashed_at TIMESTAMPTZ,
    best_rank INTEGER DEFAULT 1
);

ALTER TABLE public.grinding_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats" ON public.grinding_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.grinding_stats
    FOR ALL USING (auth.uid() = user_id);

-- 8. Slash Logs Table
CREATE TABLE public.slash_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_sec INTEGER,
    earned_tgi INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    rank_before INTEGER,
    rank_after INTEGER,
    overtaken_count INTEGER
);

ALTER TABLE public.slash_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own slash logs" ON public.slash_logs
    FOR ALL USING (auth.uid() = user_id);
