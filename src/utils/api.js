import { supabase } from '../lib/supabase.js';

/**
 * 사랑은 유행 데이터 API
 * - 모든 함수는 Supabase 쿼리 결과({ data, error })를 그대로 돌려준다.
 */

const BOOK_FIELDS = 'id, title, author, publisher, genre, description, cover_url, cover_color, cover_emoji, recommend_reason, moods, concerns, purposes, mbti, is_featured';
const AUTHOR_FIELDS = 'id, username, display_name, avatar_url';
const POST_FIELDS = `id, caption, rating, hashtags, image_url, likes_count, created_at, updated_at, user_id, book_id,
  author:sns_users!sns_posts_user_id_fkey(${AUTHOR_FIELDS}),
  book:sns_books!inner(${BOOK_FIELDS}),
  comments:sns_comments(count)`;

/* ===== 프로필 ===== */

/** auth 사용자에 연결된 프로필 조회 */
export function fetchProfileByAuthId(authId) {
  return supabase.from('sns_users').select('*').eq('auth_id', authId).maybeSingle();
}

/** 프로필 최초 생성 (username 중복 시 숫자를 붙여 재시도) */
export async function createProfile(user) {
  const meta = user.user_metadata ?? {};
  const base = (meta.username || user.email.split('@')[0])
    .toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 14).padEnd(3, '0');
  for (let i = 0; i < 5; i += 1) {
    const username = i === 0 ? base : `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
    const result = await supabase.from('sns_users').insert({
      auth_id: user.id,
      email: user.email,
      username,
      display_name: (meta.display_name || meta.full_name || base).slice(0, 30),
    }).select('*').single();
    if (!result.error || result.error.code !== '23505') return result;
  }
  return { data: null, error: new Error('아이디를 만들지 못했어요.') };
}

/** 프로필 수정 */
export function updateProfile(userId, values) {
  return supabase.from('sns_users').update(values).eq('id', userId).select('*').single();
}

/* ===== 도서 ===== */

export function fetchBooks() {
  return supabase.from('sns_books').select(BOOK_FIELDS).order('id');
}

export function fetchBook(bookId) {
  return supabase.from('sns_books').select(BOOK_FIELDS).eq('id', bookId).maybeSingle();
}

/** 제목 / 저자 검색 */
export function searchBooks(keyword) {
  const safe = keyword.replace(/[%,()*]/g, ' ').trim();
  let query = supabase.from('sns_books').select(BOOK_FIELDS).order('title').limit(30);
  if (safe) query = query.or(`title.ilike.%${safe}%,author.ilike.%${safe}%`);
  return query;
}

/** 검색에 없는 책 직접 등록 */
export function createBook(values) {
  return supabase.from('sns_books').insert(values).select(BOOK_FIELDS).single();
}

/* ===== 게시물 ===== */

/**
 * 게시물 목록
 * @param {{ sort?: 'latest'|'popular', genre?: string, userId?: number, limit?: number }} options
 */
export function fetchPosts({ sort = 'latest', genre = '', userId, limit = 30 } = {}) {
  let query = supabase.from('sns_posts').select(POST_FIELDS).limit(limit);
  query = sort === 'popular'
    ? query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
    : query.order('created_at', { ascending: false });
  if (genre) query = query.eq('book.genre', genre);
  if (userId) query = query.eq('user_id', userId);
  return query;
}

export function fetchPost(postId) {
  return supabase.from('sns_posts').select(POST_FIELDS).eq('id', postId).maybeSingle();
}

/** 같은 책의 다른 후기 */
export function fetchPostsByBook(bookId, excludeId) {
  return supabase.from('sns_posts').select(POST_FIELDS)
    .eq('book_id', bookId).neq('id', excludeId)
    .order('likes_count', { ascending: false }).limit(5);
}

export function createPost(values) {
  return supabase.from('sns_posts').insert(values).select('id').single();
}

export function updatePost(postId, values) {
  return supabase.from('sns_posts').update(values).eq('id', postId).select('id').single();
}

export function deletePost(postId) {
  return supabase.from('sns_posts').delete().eq('id', postId);
}

/* ===== 좋아요 ===== */

/** 내가 좋아요 누른 게시물 id 집합 */
export async function fetchMyLikedIds(userId, postIds) {
  if (!userId || !postIds.length) return new Set();
  const { data } = await supabase.from('sns_likes').select('post_id')
    .eq('user_id', userId).in('post_id', postIds);
  return new Set((data ?? []).map((r) => r.post_id));
}

/** 좋아요 토글 (이미 눌렀으면 취소) */
export function toggleLike(userId, postId, liked) {
  return liked
    ? supabase.from('sns_likes').delete().eq('user_id', userId).eq('post_id', postId)
    : supabase.from('sns_likes').insert({ user_id: userId, post_id: postId });
}

/* ===== 댓글 ===== */

export function fetchComments(postId) {
  return supabase.from('sns_comments')
    .select(`id, content, created_at, user_id, author:sns_users(${AUTHOR_FIELDS})`)
    .eq('post_id', postId).order('created_at');
}

export function addComment(userId, postId, content) {
  return supabase.from('sns_comments').insert({ user_id: userId, post_id: postId, content });
}

export function deleteComment(commentId) {
  return supabase.from('sns_comments').delete().eq('id', commentId);
}

/* ===== 저장한 게시물 ===== */

export async function isPostSaved(userId, postId) {
  const { data } = await supabase.from('sns_saved_posts').select('id')
    .eq('user_id', userId).eq('post_id', postId).maybeSingle();
  return Boolean(data);
}

export function toggleSave(userId, postId, saved) {
  return saved
    ? supabase.from('sns_saved_posts').delete().eq('user_id', userId).eq('post_id', postId)
    : supabase.from('sns_saved_posts').insert({ user_id: userId, post_id: postId });
}

export function fetchSavedPosts(userId) {
  return supabase.from('sns_saved_posts')
    .select(`created_at, post:sns_posts(${POST_FIELDS})`)
    .eq('user_id', userId).order('created_at', { ascending: false });
}

/* ===== 내 책장 ===== */

export function fetchShelf(userId) {
  return supabase.from('sns_user_books')
    .select(`id, reading_status, saved_at, finished_at, book:sns_books(${BOOK_FIELDS})`)
    .eq('user_id', userId).order('saved_at', { ascending: false });
}

/** 책장에 담기 (이미 있으면 상태만 변경) */
export function saveToShelf(userId, bookId, status = 'want') {
  return supabase.from('sns_user_books').upsert({
    user_id: userId,
    book_id: bookId,
    reading_status: status,
    finished_at: status === 'done' ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,book_id' });
}

export function removeFromShelf(userId, bookId) {
  return supabase.from('sns_user_books').delete().eq('user_id', userId).eq('book_id', bookId);
}

/* ===== 팔로우 ===== */

export async function fetchFollowCounts(userId) {
  const [followers, following] = await Promise.all([
    supabase.from('sns_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('sns_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

export async function isFollowing(myId, targetId) {
  const { data } = await supabase.from('sns_follows').select('id')
    .eq('follower_id', myId).eq('following_id', targetId).maybeSingle();
  return Boolean(data);
}

export function toggleFollow(myId, targetId, following) {
  return following
    ? supabase.from('sns_follows').delete().eq('follower_id', myId).eq('following_id', targetId)
    : supabase.from('sns_follows').insert({ follower_id: myId, following_id: targetId });
}

/* ===== 알림 (내 게시물에 달린 좋아요 / 댓글) ===== */

export async function fetchNotifications(userId) {
  const [likes, comments, follows] = await Promise.all([
    supabase.from('sns_likes')
      .select(`id, created_at, user_id, actor:sns_users(${AUTHOR_FIELDS}), post:sns_posts!inner(id, user_id, book:sns_books(title))`)
      .eq('post.user_id', userId).neq('user_id', userId)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('sns_comments')
      .select(`id, content, created_at, user_id, actor:sns_users(${AUTHOR_FIELDS}), post:sns_posts!inner(id, user_id, book:sns_books(title))`)
      .eq('post.user_id', userId).neq('user_id', userId)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('sns_follows')
      .select(`id, created_at, actor:sns_users!sns_follows_follower_id_fkey(${AUTHOR_FIELDS})`)
      .eq('following_id', userId)
      .order('created_at', { ascending: false }).limit(20),
  ]);
  const error = likes.error || comments.error || follows.error;
  const items = [
    ...(likes.data ?? []).map((r) => ({ ...r, type: 'like', key: `l${r.id}` })),
    ...(comments.data ?? []).map((r) => ({ ...r, type: 'comment', key: `c${r.id}` })),
    ...(follows.data ?? []).map((r) => ({ ...r, type: 'follow', key: `f${r.id}` })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { data: items, error };
}
