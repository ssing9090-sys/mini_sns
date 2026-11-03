import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

import BookCover from '../components/book-cover.jsx';
import BookDialog from '../components/book-dialog.jsx';
import Loading from '../components/loading.jsx';
import Mascot from '../components/mascot.jsx';
import { MOBILE_WIDTH } from '../components/app-layout.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useBooks } from '../hooks/use-books.js';
import { useToast } from '../hooks/use-toast.js';
import { COLORS } from '../theme.js';
import { saveToShelf } from '../utils/api.js';
import { CONCERNS, GENRE_EMOJI, GENRES, MBTI_TYPES, MOODS, PURPOSES } from '../utils/constants.js';
import { recommendBooks } from '../utils/recommend.js';

/** 설문 질문 (한 번에 하나씩) */
const QUESTIONS = [
  {
    key: 'mood', badge: '💗', mood: 'happy',
    title: '지금 기분은 어때요?', hint: '오늘의 마음에 가장 가까운 걸 골라주세요',
    options: MOODS.map((m) => ({ value: m.value, label: m.value, emoji: m.emoji })),
  },
  {
    key: 'concern', badge: '🤔', mood: 'think',
    title: '요즘 어떤 고민이 있나요?', hint: '관심 있는 주제도 좋아요',
    options: CONCERNS.map((c) => ({ value: c.value, label: c.value, emoji: c.emoji })),
  },
  {
    key: 'mbti', badge: '🧩', mood: 'wink',
    title: '나의 MBTI는?', hint: '몰라도 괜찮아요, 건너뛸 수 있어요',
    options: MBTI_TYPES.map((t) => ({ value: t, label: t })),
    columns: 4, skippable: true,
  },
  {
    key: 'genre', badge: '📚', mood: 'wow',
    title: '좋아하는 장르는?', hint: '가장 손이 가는 장르를 골라주세요',
    options: GENRES.map((g) => ({ value: g, label: g, emoji: GENRE_EMOJI[g] })),
    skippable: true,
  },
  {
    key: 'purpose', badge: '🎯', mood: 'happy',
    title: '책을 읽는 목적은?', hint: '이번 책에서 얻고 싶은 것',
    options: PURPOSES.map((p) => ({ value: p.value, label: p.label, emoji: p.emoji })),
    columns: 1,
  },
];

/** 추가 페이지 – 나에게 맞는 책 찾기 (설문형 추천) */
function FindBookPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useAuth();
  const { books, isLoading } = useBooks();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [savedIds, setSavedIds] = useState(new Set());
  const [selected, setSelected] = useState(null);

  const isDone = step >= QUESTIONS.length;
  const results = useMemo(() => (isDone ? recommendBooks(books, answers, 3) : []), [isDone, books, answers]);

  const choose = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setSavedIds(new Set());
  };

  const saveBooks = async (bookIds) => {
    if (!profile) {
      navigate('/login', { state: { from: '/find' } });
      return;
    }
    const targets = bookIds.filter((id) => !savedIds.has(id));
    if (!targets.length) {
      toast('이미 책장에 담았어요 📚', 'info');
      return;
    }
    const outcomes = await Promise.all(targets.map((id) => saveToShelf(profile.id, id, 'want')));
    if (outcomes.some((r) => r.error)) {
      toast('책장에 담지 못한 책이 있어요.', 'error');
      return;
    }
    setSavedIds((prev) => new Set([...prev, ...targets]));
    toast(`${targets.length}권을 '읽고 싶어요' 책장에 담았어요 💭`);
  };

  if (isLoading) return <Loading />;

  /* ===== 결과 화면 ===== */
  if (isDone) {
    return (
      <Box sx={ { px: 2, pt: 2.5 } }>
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 2.5 } }>
          <Mascot size={ 96 } mood="wow" badge="🎉" />
          <Typography variant="h5" sx={ { mt: 1.5 } }>냠냠이가 고른 책 3권!</Typography>
          <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mt: 1 } }>
            { Object.values(answers).filter(Boolean).map((v) => (
              <Chip key={ v } size="small" label={ v } sx={ { bgcolor: COLORS.yellowSoft } } />
            )) }
          </Box>
        </Box>

        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
          { results.map(({ book, reasons }, idx) => (
            <Paper key={ book.id } elevation={ 0 } sx={ { p: 2, border: `2px solid ${COLORS.orangeSoft}`, position: 'relative' } }>
              <Box sx={ { position: 'absolute', top: -10, left: 14, bgcolor: COLORS.orangeDeep, color: '#fff', borderRadius: 999, px: 1.25, fontSize: 13, fontWeight: 700 } }>
                추천 { idx + 1 }
              </Box>
              <Box sx={ { display: 'flex', gap: 2 } }>
                <BookCover book={ book } width={ 90 } onClick={ () => setSelected({ book, reasons }) } />
                <Box sx={ { flex: 1, minWidth: 0 } }>
                  <Typography variant="h6" sx={ { lineHeight: 1.3 } }>{ book.title }</Typography>
                  <Typography variant="body2" color="text.secondary">{ book.author } · { book.genre }</Typography>
                  <Typography sx={ { fontSize: 14, fontWeight: 700, color: COLORS.orangeDeep, mt: 0.75 } }>💬 { book.recommend_reason }</Typography>
                  <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75 } }>
                    { reasons.map((r) => <Chip key={ r } size="small" label={ `✓ ${r}` } sx={ { bgcolor: COLORS.yellowSoft, fontSize: 11.5 } } />) }
                  </Box>
                </Box>
              </Box>
              <Button
                fullWidth
                variant={ savedIds.has(book.id) ? 'outlined' : 'contained' }
                color={ savedIds.has(book.id) ? 'primary' : 'secondary' }
                onClick={ () => saveBooks([book.id]) }
                sx={ { mt: 1.5, minHeight: 42 } }
              >
                { savedIds.has(book.id) ? '✓ 책장에 담았어요' : '📚 이 책 담기' }
              </Button>
            </Paper>
          )) }
        </Box>

        <Button fullWidth onClick={ restart } sx={ { mt: 2 } }>🔄 다시 찾아보기</Button>
        <Box sx={ { height: 76 } } />

        {/* 하단 고정: 내 책장에 담기 */}
        <Box sx={ { position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: MOBILE_WIDTH, px: 2, zIndex: 15 } }>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={ () => saveBooks(results.map((r) => r.book.id)) }
            sx={ { minHeight: 56, fontSize: 18, boxShadow: '0 8px 20px rgba(240,135,90,.35)' } }
          >
            내 책장에 담기 📚
          </Button>
        </Box>

        <BookDialog book={ selected?.book ?? null } reasons={ selected?.reasons } onClose={ () => setSelected(null) } />
      </Box>
    );
  }

  /* ===== 질문 화면 ===== */
  const q = QUESTIONS[step];
  return (
    <Box sx={ { px: 2, pt: 1.5 } }>
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } }>
        <IconButton aria-label="이전 질문" onClick={ () => (step === 0 ? navigate(-1) : setStep(step - 1)) }>
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
        <LinearProgress
          variant="determinate"
          value={ ((step + 1) / QUESTIONS.length) * 100 }
          sx={ { flex: 1, height: 10, borderRadius: 999, bgcolor: COLORS.orangeSoft, '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: COLORS.orange } } }
        />
        <Typography sx={ { fontWeight: 700, fontSize: 14, minWidth: 34, textAlign: 'right' } }>{ step + 1 }/{ QUESTIONS.length }</Typography>
      </Box>

      <Box key={ q.key } sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3, animation: 'pop .3s ease', '@keyframes pop': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } } } }>
        <Mascot size={ 104 } mood={ q.mood } badge={ q.badge } color={ step % 2 ? COLORS.yellow : COLORS.orange } />
        <Typography variant="h5" sx={ { mt: 2, fontSize: 24 } }>{ q.title }</Typography>
        <Typography color="text.secondary">{ q.hint }</Typography>
      </Box>

      <Box sx={ { display: 'grid', gridTemplateColumns: `repeat(${q.columns ?? 2}, 1fr)`, gap: 1.25 } }>
        { q.options.map((opt) => {
          const active = answers[q.key] === opt.value;
          return (
            <Button
              key={ opt.value }
              onClick={ () => choose(q.key, opt.value) }
              sx={ {
                minHeight: q.columns === 4 ? 52 : 60, borderRadius: 4, color: COLORS.brown, fontSize: q.columns === 4 ? 15 : 16,
                bgcolor: active ? COLORS.yellow : '#fff', border: `2px solid ${active ? COLORS.orange : COLORS.orangeSoft}`,
                justifyContent: q.columns === 1 ? 'flex-start' : 'center', px: 2,
                '&:hover': { bgcolor: COLORS.yellowSoft },
              } }
            >
              { opt.emoji && <span style={ { fontSize: 22, marginRight: 8 } }>{ opt.emoji }</span> }
              { opt.label }
            </Button>
          );
        }) }
      </Box>

      { q.skippable && (
        <Button fullWidth onClick={ () => choose(q.key, '') } sx={ { mt: 2, color: 'text.secondary' } }>잘 모르겠어요, 건너뛸게요 →</Button>
      ) }
    </Box>
  );
}

export default FindBookPage;
