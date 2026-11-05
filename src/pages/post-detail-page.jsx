import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

import BookCover from '../components/book-cover.jsx';
import BookDialog from '../components/book-dialog.jsx';
import EmptyState from '../components/empty-state.jsx';
import Loading from '../components/loading.jsx';
import RatingStars from '../components/rating-stars.jsx';
import UserAvatar from '../components/user-avatar.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useBooks } from '../hooks/use-books.js';
import { useLikes } from '../hooks/use-likes.js';
import { useToast } from '../hooks/use-toast.js';
import { COLORS } from '../theme.js';
import {
  addComment, deleteComment, deletePost, fetchComments, fetchPost,
  isFollowing, isPostSaved, toggleFollow, toggleSave,
} from '../utils/api.js';
import { sizedImage, timeAgo } from '../utils/format.js';
import { similarBooks } from '../utils/recommend.js';

/** 게시물 상세 페이지 */
function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useAuth();
  const { books } = useBooks();

  const [posts, setPosts] = useState([]);
  const post = posts[0];
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const { likedIds, handleToggle } = useLikes(posts, setPosts);

  const isMine = profile && post && profile.id === post.user_id;

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    Promise.all([fetchPost(postId), fetchComments(postId)]).then(([p, c]) => {
      if (ignore) return;
      setPosts(p.data ? [p.data] : []);
      setComments(c.data ?? []);
      setIsLoading(false);
    });
    return () => { ignore = true; };
  }, [postId]);

  useEffect(() => {
    if (!profile || !post) return;
    let ignore = false;
    isPostSaved(profile.id, post.id).then((v) => { if (!ignore) setSaved(v); });
    if (profile.id !== post.user_id) {
      isFollowing(profile.id, post.user_id).then((v) => { if (!ignore) setFollowing(v); });
    }
    return () => { ignore = true; };
  }, [profile, post]);

  const recommendations = useMemo(
    () => (post && books.length ? similarBooks(post.book, books, 6) : []),
    [post, books],
  );

  const requireLogin = () => {
    if (profile) return true;
    navigate('/login', { state: { from: `/posts/${postId}` } });
    return false;
  };

  const handleSave = async () => {
    if (!requireLogin()) return;
    setSaved(!saved);
    const { error } = await toggleSave(profile.id, post.id, saved);
    if (error) {
      setSaved(saved);
      toast('저장하지 못했어요.', 'error');
    } else {
      toast(saved ? '저장을 취소했어요' : '저장함에 담았어요 🔖');
    }
  };

  const handleFollow = async () => {
    if (!requireLogin()) return;
    setFollowing(!following);
    const { error } = await toggleFollow(profile.id, post.user_id, following);
    if (error) {
      setFollowing(following);
      toast('팔로우를 반영하지 못했어요.', 'error');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${post.book.title} 독서 후기 | 사랑은 유행`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: post.caption.slice(0, 60), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('링크를 복사했어요 🔗');
      }
    } catch {
      /* 공유 취소 */
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!requireLogin()) return;
    const content = commentText.trim();
    if (!content) return;
    setIsSending(true);
    const { error } = await addComment(profile.id, post.id, content);
    if (error) {
      toast('댓글을 등록하지 못했어요.', 'error');
    } else {
      setCommentText('');
      const { data } = await fetchComments(post.id);
      setComments(data ?? []);
    }
    setIsSending(false);
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await deleteComment(commentId);
    if (error) toast('댓글을 삭제하지 못했어요.', 'error');
    else setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleDeletePost = async () => {
    setConfirmOpen(false);
    const { error } = await deletePost(post.id);
    if (error) {
      toast('삭제하지 못했어요.', 'error');
      return;
    }
    toast('후기를 삭제했어요');
    navigate('/feed', { replace: true });
  };

  if (isLoading) return <Loading />;
  if (!post) {
    return (
      <EmptyState
        title="후기를 찾을 수 없어요"
        description="삭제되었거나 없는 게시물이에요."
        action={ <Button variant="contained" onClick={ () => navigate('/feed') }>피드로 가기</Button> }
      />
    );
  }

  const liked = likedIds.has(post.id);

  return (
    <Box>
      {/* 상단: 책 정보 */}
      <Box sx={ { background: `linear-gradient(180deg, ${post.book.cover_color} 0%, ${COLORS.cream} 100%)`, px: 2, pt: 1, pb: 3 } }>
        <IconButton aria-label="뒤로 가기" onClick={ () => navigate(-1) } sx={ { color: COLORS.brown } }>
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } }>
          <BookCover book={ post.book } width={ 130 } onClick={ () => setSelectedBook(post.book) } />
          <Typography variant="h5" sx={ { mt: 2 } }>{ post.book.title }</Typography>
          <Typography color="text.secondary">{ post.book.author } · { post.book.genre }</Typography>
          <Box sx={ { mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 } }>
            <RatingStars value={ post.rating } size="medium" />
            <Typography sx={ { fontWeight: 700 } }>{ post.rating }.0</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={ { px: 2, display: 'flex', flexDirection: 'column', gap: 2 } }>
        {/* 작성자 */}
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.25 } }>
          <UserAvatar user={ post.author } size={ 44 } />
          <Box sx={ { flex: 1, minWidth: 0 } }>
            <Typography sx={ { fontWeight: 700 } } noWrap>{ post.author?.display_name }</Typography>
            <Typography sx={ { fontSize: 12.5, color: 'text.secondary' } }>
              @{ post.author?.username } · { timeAgo(post.created_at) }{ post.updated_at !== post.created_at ? ' (수정됨)' : '' }
            </Typography>
          </Box>
          { isMine ? (
            <IconButton aria-label="게시물 메뉴" onClick={ (e) => setMenuAnchor(e.currentTarget) }>
              <MoreHorizRoundedIcon />
            </IconButton>
          ) : (
            <Button
              size="small"
              variant={ following ? 'outlined' : 'contained' }
              onClick={ handleFollow }
              sx={ { minHeight: 36 } }
            >
              { following ? '팔로잉' : '팔로우' }
            </Button>
          ) }
        </Box>

        {/* 사진 */}
        { post.image_url && (
          <Box component="img" src={ sizedImage(post.image_url, 960) } alt="독서 후기 사진" sx={ { width: 1, borderRadius: 5, aspectRatio: '4 / 3', objectFit: 'cover' } } />
        ) }

        {/* 후기 본문 */}
        <Typography sx={ { fontSize: 15.5, lineHeight: 1.8, whiteSpace: 'pre-line' } }>{ post.caption }</Typography>
        { post.hashtags?.length > 0 && (
          <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap' } }>
            { post.hashtags.map((t) => <Chip key={ t } label={ `#${t}` } size="small" sx={ { bgcolor: COLORS.yellowSoft, color: COLORS.orangeDeep } } />) }
          </Box>
        ) }

        {/* 좋아요 / 댓글 / 저장 / 공유 */}
        <Box sx={ { display: 'flex', alignItems: 'center', borderTop: `1px solid ${COLORS.orangeSoft}`, borderBottom: `1px solid ${COLORS.orangeSoft}`, py: 0.5 } }>
          <IconButton aria-label={ liked ? '좋아요 취소' : '좋아요' } onClick={ () => handleToggle(post) } sx={ { color: liked ? '#FF7A7A' : COLORS.brown } }>
            { liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon /> }
          </IconButton>
          <Typography sx={ { fontWeight: 700, mr: 1.5 } }>{ post.likes_count }</Typography>
          <ChatBubbleOutlineRoundedIcon sx={ { mx: 1, color: COLORS.brown } } />
          <Typography sx={ { fontWeight: 700 } }>{ comments.length }</Typography>
          <Box sx={ { flex: 1 } } />
          <IconButton aria-label={ saved ? '저장 취소' : '게시물 저장' } onClick={ handleSave } sx={ { color: saved ? COLORS.orangeDeep : COLORS.brown } }>
            { saved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon /> }
          </IconButton>
          <IconButton aria-label="공유하기" onClick={ handleShare } sx={ { color: COLORS.brown } }>
            <IosShareRoundedIcon />
          </IconButton>
        </Box>

        {/* 댓글 */}
        <Box>
          <Typography variant="h6" sx={ { fontSize: 17, mb: 1 } }>💬 댓글 { comments.length }</Typography>
          { comments.length === 0 && <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>첫 댓글을 남겨주세요!</Typography> }
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 } }>
            { comments.map((c) => (
              <Box key={ c.id } sx={ { display: 'flex', gap: 1 } }>
                <UserAvatar user={ c.author } size={ 32 } />
                <Box sx={ { flex: 1, bgcolor: '#fff', borderRadius: 4, px: 1.5, py: 1, border: `1px solid ${COLORS.orangeSoft}` } }>
                  <Typography sx={ { fontSize: 13, fontWeight: 700 } }>
                    { c.author?.display_name } <span style={ { fontWeight: 400, color: COLORS.brownSoft } }>· { timeAgo(c.created_at) }</span>
                  </Typography>
                  <Typography sx={ { fontSize: 14.5, whiteSpace: 'pre-line', wordBreak: 'break-word' } }>{ c.content }</Typography>
                </Box>
                { profile?.id === c.user_id && (
                  <IconButton aria-label="댓글 삭제" size="small" onClick={ () => handleDeleteComment(c.id) } sx={ { alignSelf: 'center' } }>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                ) }
              </Box>
            )) }
          </Box>
          <Box component="form" onSubmit={ handleComment } sx={ { display: 'flex', gap: 1, alignItems: 'center' } }>
            <TextField
              size="small"
              placeholder={ profile ? '따뜻한 댓글을 남겨주세요' : '로그인하고 댓글을 남겨보세요' }
              value={ commentText }
              onChange={ (e) => setCommentText(e.target.value) }
              onFocus={ () => { if (!profile) requireLogin(); } }
              slotProps={ { htmlInput: { maxLength: 500, 'aria-label': '댓글 입력' } } }
            />
            <IconButton type="submit" aria-label="댓글 등록" disabled={ isSending || !commentText.trim() } sx={ { bgcolor: COLORS.orange, color: '#fff', width: 44, height: 44, '&:hover': { bgcolor: COLORS.orangeDeep } } }>
              <SendRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* AI 추천 – 비슷한 주제의 책 */}
        { recommendations.length > 0 && (
          <Paper elevation={ 0 } sx={ { p: 2, bgcolor: COLORS.yellowSoft, mt: 1 } }>
            <Typography variant="h6" sx={ { fontSize: 17 } }>🤖 AI 추천 · 비슷한 주제의 책</Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 1.5 } }>
              &lsquo;{ post.book.title }&rsquo;을(를) 좋아했다면 이 책도 좋아할 거예요
            </Typography>
            <Box className="hide-scrollbar" sx={ { display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 } }>
              { recommendations.map((b) => (
                <Box key={ b.id } sx={ { width: 88, flexShrink: 0 } }>
                  <BookCover book={ b } width={ 88 } onClick={ () => setSelectedBook(b) } />
                  <Typography sx={ { fontSize: 13, fontWeight: 700, mt: 0.75 } } noWrap>{ b.title }</Typography>
                  <Typography sx={ { fontSize: 11.5, color: 'text.secondary' } } noWrap>{ b.author }</Typography>
                </Box>
              )) }
            </Box>
          </Paper>
        ) }
      </Box>

      <Menu anchorEl={ menuAnchor } open={ Boolean(menuAnchor) } onClose={ () => setMenuAnchor(null) }>
        <MenuItem onClick={ () => navigate(`/posts/${post.id}/edit`) }>✏️ 수정하기</MenuItem>
        <MenuItem onClick={ () => { setMenuAnchor(null); setConfirmOpen(true); } } sx={ { color: 'error.main' } }>🗑️ 삭제하기</MenuItem>
      </Menu>

      <Dialog open={ confirmOpen } onClose={ () => setConfirmOpen(false) } slotProps={ { paper: { sx: { borderRadius: '24px' } } } }>
        <DialogTitle sx={ { fontFamily: "'Jua', sans-serif" } }>후기를 삭제할까요?</DialogTitle>
        <DialogContent>삭제한 후기와 댓글은 되돌릴 수 없어요.</DialogContent>
        <DialogActions sx={ { px: 3, pb: 2 } }>
          <Button onClick={ () => setConfirmOpen(false) }>취소</Button>
          <Button variant="contained" color="error" onClick={ handleDeletePost }>삭제</Button>
        </DialogActions>
      </Dialog>

      <BookDialog book={ selectedBook } onClose={ () => setSelectedBook(null) } />
    </Box>
  );
}

export default PostDetailPage;
