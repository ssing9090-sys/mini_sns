import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import EmptyState from '../components/empty-state.jsx';
import Loading from '../components/loading.jsx';
import PostCard from '../components/post-card.jsx';
import { useLikes } from '../hooks/use-likes.js';
import { COLORS } from '../theme.js';
import { fetchPosts } from '../utils/api.js';
import { GENRE_EMOJI, GENRES } from '../utils/constants.js';

/** 게시물(독서 후기) 목록 페이지 – 정렬 + 장르 필터 + 세로 피드 */
function FeedPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') === 'popular' ? 'popular' : 'latest';
  const genre = searchParams.get('genre') ?? '';
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { likedIds, handleToggle } = useLikes(posts, setPosts);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    fetchPosts({ sort, genre }).then(({ data, error: err }) => {
      if (ignore) return;
      setPosts(data ?? []);
      setError(err ? '후기를 불러오지 못했어요.' : '');
      setIsLoading(false);
    });
    return () => { ignore = true; };
  }, [sort, genre]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <Box>
      {/* 정렬 탭 + 장르 필터 (상단 고정) */}
      <Box sx={ { position: 'sticky', top: 60, zIndex: 5, bgcolor: 'background.default', pt: 1 } }>
        <Tabs
          value={ sort }
          onChange={ (_, v) => updateParam('sort', v === 'latest' ? '' : v) }
          variant="fullWidth"
          sx={ { px: 2, '& .MuiTab-root': { fontFamily: "'Jua', sans-serif", fontSize: 16 } } }
        >
          <Tab value="latest" label="🕐 최신순" />
          <Tab value="popular" label="💖 인기순" />
        </Tabs>
        <Box className="hide-scrollbar" sx={ { display: 'flex', gap: 1, overflowX: 'auto', px: 2, py: 1.5 } }>
          <Chip
            label="전체"
            onClick={ () => updateParam('genre', '') }
            sx={ { bgcolor: !genre ? COLORS.orange : '#fff', color: !genre ? '#fff' : COLORS.brown, border: `1px solid ${COLORS.orangeSoft}`, height: 36, px: 0.5 } }
          />
          { GENRES.map((g) => (
            <Chip
              key={ g }
              label={ `${GENRE_EMOJI[g]} ${g}` }
              onClick={ () => updateParam('genre', g) }
              sx={ { bgcolor: genre === g ? COLORS.orange : '#fff', color: genre === g ? '#fff' : COLORS.brown, border: `1px solid ${COLORS.orangeSoft}`, height: 36, px: 0.5 } }
            />
          )) }
        </Box>
      </Box>

      <Box sx={ { px: 2, display: 'flex', flexDirection: 'column', gap: 2.5 } }>
        { isLoading && <Loading /> }
        { !isLoading && error && <Typography color="error" align="center" sx={ { py: 4 } }>{ error }</Typography> }
        { !isLoading && !error && posts.length === 0 && (
          <EmptyState
            title={ genre ? `${genre} 후기가 아직 없어요` : '아직 후기가 없어요' }
            description="읽은 책의 이야기를 처음으로 들려주세요!"
            action={ <Button variant="contained" onClick={ () => navigate('/write') }>후기 작성하기 ✏️</Button> }
          />
        ) }
        { !isLoading && posts.map((post) => (
          <PostCard key={ post.id } post={ post } liked={ likedIds.has(post.id) } onToggleLike={ handleToggle } />
        )) }
      </Box>
    </Box>
  );
}

export default FeedPage;
