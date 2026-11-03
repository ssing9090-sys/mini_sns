import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

import { sizedImage } from '../utils/format.js';
import BookCover from './book-cover.jsx';

/** 인스타그램 프로필처럼 3열 썸네일 그리드 */
function PostGrid({ posts }) {
  const navigate = useNavigate();
  return (
    <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 } }>
      { posts.map((post) => (
        <Box
          key={ post.id }
          onClick={ () => navigate(`/posts/${post.id}`) }
          sx={ { position: 'relative', aspectRatio: '1', borderRadius: 3, overflow: 'hidden', cursor: 'pointer', bgcolor: post.book.cover_color, display: 'grid', placeItems: 'center' } }
        >
          { post.image_url ? (
            <Box component="img" src={ sizedImage(post.image_url, 300) } alt={ post.book.title } loading="lazy" sx={ { width: 1, height: 1, objectFit: 'cover' } } />
          ) : (
            <BookCover book={ post.book } width={ 62 } />
          ) }
          <Box sx={ { position: 'absolute', left: 0, right: 0, bottom: 0, px: 1, py: 0.5, background: 'linear-gradient(transparent, rgba(0,0,0,.45))', color: '#fff', display: 'flex', alignItems: 'center', gap: 0.5 } }>
            <FavoriteRoundedIcon sx={ { fontSize: 14 } } />
            <Typography sx={ { fontSize: 12, fontWeight: 700 } }>{ post.likes_count }</Typography>
          </Box>
        </Box>
      )) }
    </Box>
  );
}

export default PostGrid;
