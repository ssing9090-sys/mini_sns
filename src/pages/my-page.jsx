import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import BookDialog from '../components/book-dialog.jsx';
import Bookshelf from '../components/bookshelf.jsx';
import EmptyState from '../components/empty-state.jsx';
import Loading from '../components/loading.jsx';
import PostGrid from '../components/post-grid.jsx';
import ProfileEditDialog from '../components/profile-edit-dialog.jsx';
import ReadingStats from '../components/reading-stats.jsx';
import UserAvatar from '../components/user-avatar.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import { COLORS } from '../theme.js';
import {
  fetchFollowCounts, fetchPosts, fetchSavedPosts, fetchShelf,
  removeFromShelf, saveToShelf, updateProfile,
} from '../utils/api.js';
import { READING_STATUS } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

const TABS = [
  { value: 'shelf', label: '📚 책장' },
  { value: 'posts', label: '📝 후기' },
  { value: 'saved', label: '🔖 저장' },
  { value: 'stats', label: '📊 통계' },
];

/** 숫자 + 이름 */
function Stat({ value, label }) {
  return (
    <Box sx={ { textAlign: 'center', flex: 1 } }>
      <Typography variant="h6" sx={ { lineHeight: 1.2 } }>{ value }</Typography>
      <Typography sx={ { fontSize: 12.5, color: 'text.secondary' } }>{ label }</Typography>
    </Box>
  );
}

/** 마이페이지 */
function MyPage() {
  const { profile, setProfile, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === searchParams.get('tab')) ? searchParams.get('tab') : 'shelf';

  const [isLoading, setIsLoading] = useState(true);
  const [shelf, setShelf] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [follow, setFollow] = useState({ followers: 0, following: 0 });
  const [shelfFilter, setShelfFilter] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const loadAll = useCallback(async () => {
    const [s, p, sv, f] = await Promise.all([
      fetchShelf(profile.id),
      fetchPosts({ userId: profile.id, limit: 100 }),
      fetchSavedPosts(profile.id),
      fetchFollowCounts(profile.id),
    ]);
    setShelf(s.data ?? []);
    setMyPosts(p.data ?? []);
    setSavedPosts((sv.data ?? []).map((r) => r.post).filter(Boolean));
    setFollow(f);
    setIsLoading(false);
  }, [profile.id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const doneCount = shelf.filter((s) => s.reading_status === 'done').length;
  const doneThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    return shelf.filter((s) => s.reading_status === 'done' && s.finished_at && new Date(s.finished_at).getFullYear() === year).length;
  }, [shelf]);
  const goalPercent = Math.min(100, Math.round((doneThisYear / profile.reading_goal) * 100));
  const filteredShelf = shelfFilter ? shelf.filter((s) => s.reading_status === shelfFilter) : shelf;

  const handleChangeStatus = async (item, status) => {
    const { error } = await saveToShelf(profile.id, item.book.id, status);
    if (error) {
      toast('상태를 바꾸지 못했어요.', 'error');
      return;
    }
    toast(`'${READING_STATUS[status].label}'(으)로 옮겼어요 ${READING_STATUS[status].emoji}`);
    const { data } = await fetchShelf(profile.id);
    setShelf(data ?? []);
  };

  const handleRemove = async (item) => {
    const { error } = await removeFromShelf(profile.id, item.book.id);
    if (error) {
      toast('책장에서 빼지 못했어요.', 'error');
      return;
    }
    setShelf((prev) => prev.filter((s) => s.id !== item.id));
    toast('책장에서 뺐어요');
  };

  const handleSaveProfile = async (values) => {
    const { data, error } = await updateProfile(profile.id, values);
    if (error) {
      toast('프로필을 저장하지 못했어요.', 'error');
      return;
    }
    setProfile(data);
    setEditOpen(false);
    toast('프로필을 수정했어요 ✨');
  };

  const handleLogout = async () => {
    await signOut();
    toast('로그아웃했어요. 또 만나요! 👋', 'info');
    navigate('/');
  };

  if (isLoading) return <Loading />;

  return (
    <Box sx={ { px: 2, pt: 2.5 } }>
      {/* 프로필 */}
      <Paper elevation={ 0 } sx={ { p: 2.5, background: `linear-gradient(135deg, ${COLORS.orangeSoft}, ${COLORS.yellowSoft})` } }>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
          <UserAvatar user={ profile } size={ 76 } />
          <Box sx={ { flex: 1, minWidth: 0 } }>
            <Typography variant="h5" sx={ { fontSize: 22 } } noWrap>{ profile.display_name }</Typography>
            <Typography sx={ { fontSize: 13.5, color: 'text.secondary' } }>@{ profile.username }</Typography>
            <Typography sx={ { fontSize: 14, mt: 0.5, wordBreak: 'break-word' } }>
              { profile.bio || '한줄 소개를 적어보세요 ✍️' }
            </Typography>
          </Box>
        </Box>
        <Box sx={ { display: 'flex', mt: 2, bgcolor: 'rgba(255,255,255,.7)', borderRadius: 4, py: 1.25 } }>
          <Stat value={ doneCount } label="읽은 책" />
          <Stat value={ myPosts.length } label="후기" />
          <Stat value={ follow.followers } label="팔로워" />
          <Stat value={ follow.following } label="팔로잉" />
        </Box>
        <Button fullWidth variant="contained" color="secondary" onClick={ () => setEditOpen(true) } sx={ { mt: 1.5, minHeight: 40 } }>
          프로필 수정
        </Button>
      </Paper>

      {/* 독서 목표 */}
      <Paper elevation={ 0 } sx={ { p: 2, mt: 2, border: `1px solid ${COLORS.orangeSoft}` } }>
        <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 } }>
          <Typography variant="h6" sx={ { fontSize: 16 } }>🎯 { new Date().getFullYear() }년 독서 목표</Typography>
          <Typography sx={ { fontWeight: 700 } }>
            <span style={ { color: COLORS.orangeDeep } }>{ doneThisYear }</span> / { profile.reading_goal }권
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={ goalPercent } sx={ { height: 12, borderRadius: 999, bgcolor: '#F6EBE1', '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: COLORS.orange } } } />
        <Typography sx={ { fontSize: 12.5, color: 'text.secondary', mt: 0.75 } }>
          { goalPercent >= 100 ? '목표 달성! 정말 대단해요 🏆' : `목표까지 ${profile.reading_goal - doneThisYear}권 남았어요. 화이팅! 💪` }
        </Typography>
      </Paper>

      {/* 탭 */}
      <Tabs
        value={ tab }
        onChange={ (_, v) => setSearchParams({ tab: v }, { replace: true }) }
        variant="fullWidth"
        sx={ { mt: 2, mb: 2, '& .MuiTab-root': { fontFamily: "'Jua', sans-serif", fontSize: 15, minWidth: 0, px: 0.5 } } }
      >
        { TABS.map((t) => <Tab key={ t.value } value={ t.value } label={ t.label } />) }
      </Tabs>

      { tab === 'shelf' && (
        <Box>
          <Box className="hide-scrollbar" sx={ { display: 'flex', gap: 1, overflowX: 'auto', mb: 1.5 } }>
            <Chip label={ `전체 ${shelf.length}` } onClick={ () => setShelfFilter('') } sx={ { bgcolor: !shelfFilter ? COLORS.orange : '#fff', color: !shelfFilter ? '#fff' : COLORS.brown, height: 36 } } />
            { Object.entries(READING_STATUS).map(([status, info]) => (
              <Chip
                key={ status }
                label={ `${info.emoji} ${info.label} ${shelf.filter((s) => s.reading_status === status).length}` }
                onClick={ () => setShelfFilter(status) }
                sx={ { bgcolor: shelfFilter === status ? COLORS.orange : '#fff', color: shelfFilter === status ? '#fff' : COLORS.brown, height: 36 } }
              />
            )) }
          </Box>
          { filteredShelf.length === 0 ? (
            <EmptyState
              title="책장이 비어 있어요"
              description="마음에 드는 책을 찾아 책장에 담아보세요"
              action={ <Button variant="contained" onClick={ () => navigate('/find') }>나에게 맞는 책 찾기 🔍</Button> }
            />
          ) : (
            <>
              <Typography sx={ { fontSize: 12.5, color: 'text.secondary', mb: 1 } }>책을 누르면 상태를 바꾸거나 뺄 수 있어요</Typography>
              <Bookshelf items={ filteredShelf } onChangeStatus={ handleChangeStatus } onRemove={ handleRemove } onOpen={ setSelectedBook } />
            </>
          ) }
        </Box>
      ) }

      { tab === 'posts' && (myPosts.length === 0 ? (
        <EmptyState
          title="아직 작성한 후기가 없어요"
          action={ <Button variant="contained" onClick={ () => navigate('/write') }>첫 후기 쓰기 ✏️</Button> }
        />
      ) : <PostGrid posts={ myPosts } />) }

      { tab === 'saved' && (savedPosts.length === 0 ? (
        <EmptyState title="저장한 후기가 없어요" description="마음에 드는 후기의 🔖 버튼을 눌러 저장해보세요" />
      ) : <PostGrid posts={ savedPosts } />) }

      { tab === 'stats' && <ReadingStats shelf={ shelf } posts={ myPosts } /> }

      {/* 계정 설정 */}
      <Paper elevation={ 0 } sx={ { p: 2, mt: 4, border: `1px solid ${COLORS.orangeSoft}` } }>
        <Typography variant="h6" sx={ { fontSize: 16, mb: 1 } }>⚙️ 계정 설정</Typography>
        <Typography sx={ { fontSize: 14 } }>이메일 · { profile.email }</Typography>
        <Typography sx={ { fontSize: 14, color: 'text.secondary', mb: 1.5 } }>가입일 · { formatDate(profile.created_at) }</Typography>
        <Button fullWidth variant="outlined" color="inherit" startIcon={ <LogoutRoundedIcon /> } onClick={ handleLogout }>
          로그아웃
        </Button>
      </Paper>

      { editOpen && <ProfileEditDialog open profile={ profile } onClose={ () => setEditOpen(false) } onSave={ handleSaveProfile } /> }
      <BookDialog book={ selectedBook } onClose={ () => { setSelectedBook(null); loadAll(); } } />
    </Box>
  );
}

export default MyPage;
