import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { COLORS } from '../theme.js';
import { GENRE_EMOJI, READING_STATUS } from '../utils/constants.js';

/** 가로 막대 한 줄 */
function BarRow({ label, value, max, color }) {
  return (
    <Box sx={ { display: 'grid', gridTemplateColumns: '78px 1fr 28px', alignItems: 'center', gap: 1, mb: 1 } }>
      <Typography sx={ { fontSize: 13.5 } } noWrap>{ label }</Typography>
      <Box sx={ { height: 14, bgcolor: '#F6EBE1', borderRadius: 999, overflow: 'hidden' } }>
        <Box sx={ { height: 1, width: `${max ? (value / max) * 100 : 0}%`, bgcolor: color, borderRadius: 999, transition: 'width .4s' } } />
      </Box>
      <Typography sx={ { fontSize: 13.5, fontWeight: 700, textAlign: 'right' } }>{ value }</Typography>
    </Box>
  );
}

/**
 * 독서 통계 – 상태별 권수, 장르 분포, 최근 6개월 완독, 평균 별점
 * @param {{ shelf: object[], posts: object[] }} props
 */
function ReadingStats({ shelf, posts }) {
  const stats = useMemo(() => {
    const byStatus = { want: 0, reading: 0, done: 0 };
    const byGenre = {};
    shelf.forEach((item) => {
      byStatus[item.reading_status] += 1;
      byGenre[item.book.genre] = (byGenre[item.book.genre] ?? 0) + 1;
    });
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: `${d.getMonth() + 1}월`, count: 0 };
    });
    shelf.filter((s) => s.reading_status === 'done' && s.finished_at).forEach((s) => {
      const d = new Date(s.finished_at);
      const month = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (month) month.count += 1;
    });
    const avgRating = posts.length ? posts.reduce((sum, p) => sum + p.rating, 0) / posts.length : 0;
    const genres = Object.entries(byGenre).sort((a, b) => b[1] - a[1]);
    return { byStatus, genres, months, avgRating };
  }, [shelf, posts]);

  const maxGenre = stats.genres[0]?.[1] ?? 0;
  const maxMonth = Math.max(1, ...stats.months.map((m) => m.count));

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
      <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 } }>
        { Object.entries(READING_STATUS).map(([status, info]) => (
          <Paper key={ status } elevation={ 0 } sx={ { p: 1.5, textAlign: 'center', bgcolor: info.color } }>
            <Typography sx={ { fontSize: 22 } }>{ info.emoji }</Typography>
            <Typography variant="h5">{ stats.byStatus[status] }</Typography>
            <Typography sx={ { fontSize: 12.5 } }>{ info.label }</Typography>
          </Paper>
        )) }
      </Box>

      <Paper elevation={ 0 } sx={ { p: 2, border: `1px solid ${COLORS.orangeSoft}` } }>
        <Typography variant="h6" sx={ { fontSize: 16, mb: 1.5 } }>📅 최근 6개월 완독</Typography>
        <Box sx={ { display: 'flex', alignItems: 'flex-end', gap: 1, height: 120 } }>
          { stats.months.map((m) => (
            <Box key={ m.key } sx={ { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: 1, justifyContent: 'flex-end' } }>
              <Typography sx={ { fontSize: 12, fontWeight: 700 } }>{ m.count || '' }</Typography>
              <Box sx={ { width: '70%', height: `${(m.count / maxMonth) * 80}%`, minHeight: 4, bgcolor: m.count ? COLORS.orange : '#F6EBE1', borderRadius: '8px 8px 4px 4px' } } />
              <Typography sx={ { fontSize: 11.5, color: 'text.secondary' } }>{ m.label }</Typography>
            </Box>
          )) }
        </Box>
      </Paper>

      <Paper elevation={ 0 } sx={ { p: 2, border: `1px solid ${COLORS.orangeSoft}` } }>
        <Typography variant="h6" sx={ { fontSize: 16, mb: 1.5 } }>🎨 좋아하는 장르</Typography>
        { stats.genres.length === 0 ? (
          <Typography variant="body2" color="text.secondary">책장에 책을 담으면 장르 통계가 보여요.</Typography>
        ) : stats.genres.map(([genre, count]) => (
          <BarRow key={ genre } label={ `${GENRE_EMOJI[genre] ?? '📖'} ${genre}` } value={ count } max={ maxGenre } color={ COLORS.orange } />
        )) }
      </Paper>

      <Paper elevation={ 0 } sx={ { p: 2, display: 'flex', justifyContent: 'space-around', textAlign: 'center', bgcolor: COLORS.yellowSoft } }>
        <Box>
          <Typography variant="h5">{ posts.length }</Typography>
          <Typography sx={ { fontSize: 13 } }>작성한 후기</Typography>
        </Box>
        <Box>
          <Typography variant="h5">⭐ { stats.avgRating ? stats.avgRating.toFixed(1) : '-' }</Typography>
          <Typography sx={ { fontSize: 13 } }>평균 별점</Typography>
        </Box>
        <Box>
          <Typography variant="h5">{ posts.reduce((s, p) => s + p.likes_count, 0) }</Typography>
          <Typography sx={ { fontSize: 13 } }>받은 하트</Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default ReadingStats;
