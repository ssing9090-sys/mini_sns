import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

import { COLORS } from '../theme.js';
import { sizedImage, timeAgo } from '../utils/format.js';
import BookCover from './book-cover.jsx';
import RatingStars from './rating-stars.jsx';
import UserAvatar from './user-avatar.jsx';

/**
 * 세로형 피드 카드 (인스타그램 스타일)
 * @param {{ post: object, liked: boolean, onToggleLike: function }} props
 */
function PostCard({ post, liked, onToggleLike }) {
  const navigate = useNavigate();
  const open = () => navigate(`/posts/${post.id}`);
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <Paper elevation={ 0 } sx={ { overflow: 'hidden', border: `1px solid ${COLORS.orangeSoft}` } }>
      {/* 작성자 */}
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5 } }>
        <UserAvatar user={ post.author } size={ 36 } />
        <Box sx={ { flex: 1, minWidth: 0 } }>
          <Typography sx={ { fontWeight: 700, fontSize: 14.5 } } noWrap>{ post.author?.display_name }</Typography>
          <Typography sx={ { fontSize: 12, color: 'text.secondary' } }>@{ post.author?.username } · { timeAgo(post.created_at) }</Typography>
        </Box>
      </Box>

      {/* 대표 이미지 (선택한 사진 또는 책 표지) */}
      <Box onClick={ open } sx={ { cursor: 'pointer', position: 'relative' } }>
        { post.image_url ? (
          <Box
            component="img"
            src={ sizedImage(post.image_url, 720) }
            alt="독서 후기 사진"
            loading="lazy"
            sx={ { width: 1, aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' } }
          />
        ) : (
          <Box sx={ { aspectRatio: '4 / 3', display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${COLORS.yellowSoft}, ${post.book.cover_color})` } }>
            <BookCover book={ post.book } width={ 120 } />
          </Box>
        ) }
        { post.image_url && (
          <Box sx={ { position: 'absolute', left: 12, bottom: -28 } }>
            <BookCover book={ post.book } width={ 58 } />
          </Box>
        ) }
      </Box>

      {/* 책 정보 */}
      <Box onClick={ open } sx={ { cursor: 'pointer', pl: post.image_url ? 10.5 : 2, pr: 2, pt: 1.25 } }>
        <Typography sx={ { fontFamily: "'Jua', sans-serif", fontSize: 16 } } noWrap>{ post.book.title }</Typography>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.75 } }>
          <Typography sx={ { fontSize: 12.5, color: 'text.secondary' } } noWrap>{ post.book.author }</Typography>
          <RatingStars value={ post.rating } />
        </Box>
      </Box>

      {/* 후기 미리보기 */}
      <Box onClick={ open } sx={ { cursor: 'pointer', px: 2, pt: 1.25 } }>
        <Typography
          sx={ {
            fontSize: 14.5, lineHeight: 1.6, whiteSpace: 'pre-line',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } }
        >
          { post.caption }
        </Typography>
        { post.hashtags?.length > 0 && (
          <Typography sx={ { fontSize: 13, color: COLORS.orangeDeep, mt: 0.5 } } noWrap>
            { post.hashtags.map((t) => `#${t}`).join(' ') }
          </Typography>
        ) }
      </Box>

      {/* 하트 / 댓글 */}
      <Box sx={ { display: 'flex', alignItems: 'center', px: 1, pb: 1 } }>
        <IconButton aria-label={ liked ? '좋아요 취소' : '좋아요' } onClick={ () => onToggleLike(post) } sx={ { color: liked ? '#FF7A7A' : COLORS.brown } }>
          { liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon /> }
        </IconButton>
        <Typography sx={ { fontSize: 14, fontWeight: 700, mr: 1.5 } }>{ post.likes_count }</Typography>
        <IconButton aria-label="댓글 보기" onClick={ open } sx={ { color: COLORS.brown } }>
          <ChatBubbleOutlineRoundedIcon />
        </IconButton>
        <Typography sx={ { fontSize: 14, fontWeight: 700 } }>{ commentCount }</Typography>
      </Box>
    </Paper>
  );
}

export default PostCard;
