import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DynamicFeedRoundedIcon from '@mui/icons-material/DynamicFeedRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { COLORS } from '../theme.js';
import { SERVICE_NAME } from '../utils/constants.js';
import Mascot from './mascot.jsx';

export const MOBILE_WIDTH = 480;

const TABS = [
  { to: '/', label: '홈', icon: HomeRoundedIcon },
  { to: '/feed', label: '피드', icon: DynamicFeedRoundedIcon },
  null, // 가운데 작성 버튼 자리
  { to: '/find', label: '책 찾기', icon: AutoAwesomeRoundedIcon },
  { to: '/my', label: '마이', icon: PersonRoundedIcon },
];

/** 상단 바(로고·검색·알림) + 하단 고정 탭 + 가운데 작성 버튼 */
function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <Box sx={ { maxWidth: MOBILE_WIDTH, mx: 'auto', minHeight: '100vh', bgcolor: 'background.default', position: 'relative', boxShadow: '0 0 40px rgba(240,135,90,.12)' } }>
      {/* 상단 바 */}
      <Box
        component="header"
        sx={ {
          position: 'sticky', top: 0, zIndex: 10, height: 60, px: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'rgba(255,249,242,.92)', backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${COLORS.orangeSoft}`,
        } }
      >
        <Box component={ RouterLink } to="/" sx={ { display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none' } }>
          <Mascot size={ 34 } mood="wink" />
          <Typography variant="h6" sx={ { color: COLORS.orangeDeep, fontSize: 22, letterSpacing: '-0.5px' } }>
            { SERVICE_NAME }
          </Typography>
        </Box>
        <Box>
          <IconButton aria-label="책 검색" onClick={ () => navigate('/search') } sx={ { color: COLORS.brown } }>
            <SearchRoundedIcon />
          </IconButton>
          <IconButton aria-label="알림" onClick={ () => navigate('/notifications') } sx={ { color: COLORS.brown } }>
            <NotificationsNoneRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 본문 */}
      <Box component="main" sx={ { pb: 13 } }>
        <Outlet />
      </Box>

      {/* 하단 고정 탭 */}
      <Box
        component="nav"
        aria-label="하단 메뉴"
        sx={ {
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: MOBILE_WIDTH, zIndex: 20, height: 72,
          pb: 'env(safe-area-inset-bottom)',
          bgcolor: '#fff', borderTop: `1px solid ${COLORS.orangeSoft}`,
          borderRadius: '24px 24px 0 0', boxShadow: '0 -6px 20px rgba(240,135,90,.12)',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center',
        } }
      >
        { TABS.map((tab) => {
          if (!tab) {
            return (
              <Box key="write" sx={ { display: 'grid', placeItems: 'center' } }>
                <IconButton
                  aria-label="독서 후기 작성"
                  onClick={ () => navigate('/write') }
                  sx={ {
                    width: 60, height: 60, mt: -4, color: '#fff',
                    background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.orangeDeep})`,
                    border: '4px solid #fff', boxShadow: '0 6px 16px rgba(240,135,90,.45)',
                    '&:hover': { background: COLORS.orangeDeep },
                  } }
                >
                  <AddRoundedIcon sx={ { fontSize: 32 } } />
                </IconButton>
              </Box>
            );
          }
          const Icon = tab.icon;
          const active = isActive(tab.to);
          return (
            <Box
              key={ tab.to }
              component={ RouterLink }
              to={ tab.to }
              sx={ {
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25,
                textDecoration: 'none', py: 1, color: active ? COLORS.orangeDeep : '#BFA898',
              } }
            >
              <Icon />
              <Typography sx={ { fontSize: 11.5, fontWeight: active ? 700 : 500 } }>{ tab.label }</Typography>
            </Box>
          );
        }) }
      </Box>
    </Box>
  );
}

export default AppLayout;
