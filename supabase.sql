-- AITune Supabase 数据库设置脚本
-- 运行方式：在 Supabase Dashboard -> SQL Editor -> 执行此脚本

-- ============================================
-- 1. 创建表结构
-- ============================================

-- 用户资料表 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  songs_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 歌曲表 (songs)
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  lrc_url TEXT,
  plain_lyrics TEXT,
  ai_tool TEXT NOT NULL CHECK (ai_tool IN ('Suno', 'Udio', 'MusicGen', 'Stable Audio', '其他')),
  style_tags TEXT[] DEFAULT '{}',
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 点赞表 (likes)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- 收藏表 (favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- 歌单表 (playlists)
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 歌单歌曲关联表 (playlist_songs)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- 评论表 (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 关注表 (follows)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 通知表 (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'system', 'milestone')),
  title TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 创建索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_songs_creator ON public.songs(creator_id);
CREATE INDEX IF NOT EXISTS idx_songs_ai_tool ON public.songs(ai_tool);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON public.songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_song ON public.likes(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_song ON public.comments(song_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- 3. Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- profiles 策略
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- songs 策略
CREATE POLICY "Public songs are viewable by everyone"
  ON public.songs FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can insert their own songs"
  ON public.songs FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own songs"
  ON public.songs FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own songs"
  ON public.songs FOR DELETE USING (auth.uid() = creator_id);

-- likes 策略
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes"
  ON public.likes FOR ALL USING (auth.uid() = user_id);

-- favorites 策略
CREATE POLICY "Favorites are viewable by everyone"
  ON public.favorites FOR SELECT USING (true);

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- playlists 策略
CREATE POLICY "Public playlists are viewable by everyone"
  ON public.playlists FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own playlists"
  ON public.playlists FOR ALL USING (auth.uid() = user_id);

-- playlist_songs 策略
CREATE POLICY "Users can manage their own playlist songs"
  ON public.playlist_songs FOR ALL
  USING (
    playlist_id IN (SELECT id FROM public.playlists WHERE user_id = auth.uid())
  );

-- comments 策略
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- follows 策略
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows"
  ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- notifications 策略
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. 存储桶设置 (Storage Buckets)
-- ============================================

-- 创建音频存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- 创建封面图存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- 创建歌词文件存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('lyrics', 'lyrics', true)
ON CONFLICT (id) DO NOTHING;

-- 存储策略
CREATE POLICY "Audio files are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Audio owners can update their files"
  ON storage.objects FOR UPDATE USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio owners can delete their files"
  ON storage.objects FOR DELETE USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Cover images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Lyrics files are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'lyrics');

CREATE POLICY "Authenticated users can upload lyrics"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lyrics' AND auth.role() = 'authenticated');

-- ============================================
-- 5. 自动更新函数
-- ============================================

-- 更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 自动创建用户资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', '用户' || substr(NEW.id::text, 1, 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 自动更新歌曲数量
CREATE OR REPLACE FUNCTION public.update_songs_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET songs_count = songs_count + 1 WHERE id = NEW.creator_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET songs_count = songs_count - 1 WHERE id = OLD.creator_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_songs_count
  AFTER INSERT OR DELETE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_songs_count();

-- 自动更新评论数量
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NULL THEN
    UPDATE public.songs SET comment_count = comment_count + 1 WHERE id = NEW.song_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NULL THEN
    UPDATE public.songs SET comment_count = comment_count - 1 WHERE id = OLD.song_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_song_comment_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- ============================================
-- 6. 启用实时订阅 (可选)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- 完成！执行以下命令测试：
-- ============================================
-- SELECT * FROM public.profiles LIMIT 1;
