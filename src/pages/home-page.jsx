import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import BookCover from '../components/book-cover.jsx';
import BookDialog from '../components/book-dialog.jsx';
import Loading from '../components/loading.jsx';
import Mascot from '../components/mascot.jsx';
import PostCard from '../components/post-card.jsx';
import SectionTitle from '../components/section-title.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useBooks } from '../hooks/use-books.js';
import { useLikes } from '../hooks/use-likes.js';
import { COLORS } from '../theme.js';
import { fetchPosts } from '../utils/api.js';
import { MOODS, SERVICE_SLOGAN } from '../utils/constants.js';
import { booksForMood, todayPick } from '../utils/recommend.js';

/** 가로 스크롤 도서 카드 목록 */
function BookRow({ books, onSelect }) {
  return (
    <Box className="hide-scrollbar" sx={ { display: 'flex', gap: 1.5, overflowX: 'auto', mx: -2, px: 2, pb: 1 } }>
      { books.map((book) => (
        <Box key={ book.id } onClick={ () => onSelect(book) } sx={ { width: 112, flexShrink: 0, cursor: 'pointer' } }>
          <BookCover book={ book } width={ 112 } />
          <Typography sx={ { fontFamily: "'Jua', sans-serif", fontSize: 14.5, mt: 1 } } noWrap>{ book.title }</Typography>
          <Typography sx={ { fontSize: 12, color: 'text.secondary' } } noWrap>{ book.author }</Typography>
          <Typography sx={ { fontSize: 12, color: COLORS.orangeDeep, lineHeight: 1.35, mt: 0.25 } }>
            { book.recommend_reason }
          </Typography>
        </Box>
      )) }
    </Box>
  );
}

/** 메인(홈) 페이지 */
function HomePage() {
  const { profile } = useAuth();
  const { books, isLoading } = useBooks();
  const navigate = useNavigate();
  const [mood, setMood] = useState(MOODS[0].value);
  const [selectedBook, setSelectedBook] = useState(null);
  const [posts, setPosts] = useState([]);
  const { likedIds, handleToggle } = useLikes(posts, setPosts);

  useEffect(() => {
    fetchPosts({ sort: 'popular', limit: 3 }).then(({ data }) => setPosts(data ?? []));
  }, []);

  const pick = useMemo(() => todayPick(books, profile?.username ?? 'guest'), [books, profile?.username]);
  const moodBooks = useMemo(() => booksForMood(books, mood, 6), [books, mood]);
  const featured = useMemo(() => books.filter((b) => b.is_featured), [books]);

  if (isLoading) return <Loading />;

  return (
    <Box sx={ { px: 2, pt: 2.5, display: 'flex', flexDirection: 'column', gap: 4 } }>
      {/* 인사 */}
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
        <Mascot size={ 64 } mood="happy" />
        <Box>
          <Typography variant="h5" sx={ { fontSize: 22 } }>
            { profile ? `${profile.display_name}님, 안녕하세요!` : '반가워요, 책친구!' }
          </Typography>
          <Typography variant="body2" color="text.secondary">{ SERVICE_SLOGAN }</Typography>
        </Box>
      </Box>

      {/* 오늘의 맞춤 추천 */}
      { pick && (
        <Box>
          <SectionTitle emoji="🎁" title="오늘의 맞춤 책" subtitle="매일 새로운 한 권을 골라드려요" />
          <Paper
            elevation={ 0 }
            onClick={ () => setSelectedBook(pick) }
            sx={ {
              p: 2.25, display: 'flex', gap: 2, cursor: 'pointer', alignItems: 'center',
              background: `linear-gradient(135deg, ${COLORS.orangeSoft}, ${COLORS.yellowSoft})`,
            } }
          >
            <BookCover book={ pick } width={ 100 } />
            <Box sx={ { minWidth: 0 } }>
              <Typography sx={ { fontSize: 12, fontWeight: 700, color: COLORS.orangeDeep } }>TODAY&apos;S PICK</Typography>
              <Typography variant="h6" sx={ { lineHeight: 1.3 } }>{ pick.title }</Typography>
              <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>{ pick.author } · { pick.genre }</Typography>
              <Box sx={ { bgcolor: '#fff', borderRadius: 3, px: 1.5, py: 0.75, display: 'inline-block' } }>
                <Typography sx={ { fontSize: 13.5, fontWeight: 700 } }>💬 { pick.recommend_reason }</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      ) }

      {/* 감정별 추천 */}
      <Box>
        <SectionTitle emoji="💗" title="지금 기분이 어때요?" subtitle="감정을 고르면 딱 맞는 책을 추천해요" />
        <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 } }>
          { MOODS.map((m) => {
            const active = mood === m.value;
            return (
              <Button
                key={ m.value }
                onClick={ () => setMood(m.value) }
                aria-pressed={ active }
                sx={ {
                  flexDirection: 'column', py: 1.25, borderRadius: 4, color: COLORS.brown,
                  bgcolor: active ? m.color : '#fff',
                  border: `2px solid ${active ? COLORS.orange : COLORS.orangeSoft}`,
                  transform: active ? 'translateY(-2px)' : 'none', transition: 'all .15s',
                  '&:hover': { bgcolor: m.color },
                } }
              >
                <span style={ { fontSize: 26, lineHeight: 1.2 } }>{ m.emoji }</span>
                <span style={ { fontSize: 13.5 } }>{ m.value }</span>
              </Button>
            );
          }) }
        </Box>
        <BookRow books={ moodBooks } onSelect={ setSelectedBook } />
      </Box>

      {/* 나에게 맞는 책 찾기 배너 */}
      <Paper
        elevation={ 0 }
        onClick={ () => navigate('/find') }
        sx={ { p: 2.25, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', bgcolor: COLORS.yellow } }
      >
        <Mascot size={ 58 } mood="wow" badge="🔍" />
        <Box sx={ { flex: 1 } }>
          <Typography variant="h6" sx={ { fontSize: 18 } }>나에게 맞는 책 찾기</Typography>
          <Typography variant="body2">기분·고민·MBTI로 딱 3권 골라드려요!</Typography>
        </Box>
        <Typography sx={ { fontSize: 24 } }>›</Typography>
      </Paper>

      {/* 인기 / 추천 도서 */}
      <Box>
        <SectionTitle emoji="🔥" title="요즘 인기 도서" subtitle="북냠냠 친구들이 많이 찾는 책" />
        <BookRow books={ featured } onSelect={ setSelectedBook } />
      </Box>

      {/* 독서 후기 미리보기 */}
      <Box>
        <SectionTitle emoji="📝" title="친구들의 독서 후기" moreTo="/feed" />
        { posts.length === 0 ? (
          <Paper elevation={ 0 } sx={ { p: 3, textAlign: 'center', border: `1px dashed ${COLORS.orange}` } }>
            <Typography sx={ { mb: 1.5 } }>아직 후기가 없어요. 첫 후기의 주인공이 되어주세요!</Typography>
            <Button variant="contained" onClick={ () => navigate('/write') }>후기 쓰러 가기 ✏️</Button>
          </Paper>
        ) : (
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
            { posts.map((post) => (
              <PostCard key={ post.id } post={ post } liked={ likedIds.has(post.id) } onToggleLike={ handleToggle } />
            )) }
          </Box>
        ) }
      </Box>

      <BookDialog book={ selectedBook } onClose={ () => setSelectedBook(null) } />
    </Box>
  );
}

export default HomePage;
