import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchMyLikedIds, toggleLike } from '../utils/api.js';
import { useAuth } from './use-auth.js';
import { useToast } from './use-toast.js';

/**
 * 게시물 목록의 좋아요 상태 관리
 * - 내가 누른 게시물 id 를 불러오고, 누르면 화면을 먼저 바꾼 뒤(낙관적 업데이트) 서버에 반영한다.
 * @param {object[]} posts
 * @param {function} setPosts
 */
export function useLikes(posts, setPosts) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [likedIds, setLikedIds] = useState(new Set());
  const idsKey = posts.map((p) => p.id).join(',');

  useEffect(() => {
    let ignore = false;
    fetchMyLikedIds(profile?.id, idsKey ? idsKey.split(',').map(Number) : [])
      .then((ids) => { if (!ignore) setLikedIds(ids); });
    return () => { ignore = true; };
  }, [profile?.id, idsKey]);

  const handleToggle = async (post) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    const liked = likedIds.has(post.id);
    const apply = (isLiked) => {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(post.id); else next.delete(post.id);
        return next;
      });
      setPosts((prev) => prev.map((p) => (p.id === post.id
        ? { ...p, likes_count: Math.max(0, p.likes_count + (isLiked ? 1 : -1)) }
        : p)));
    };
    apply(!liked);
    const { error } = await toggleLike(profile.id, post.id, liked);
    if (error) {
      apply(liked);
      toast('좋아요를 반영하지 못했어요.', 'error');
    }
  };

  return { likedIds, handleToggle };
}
