import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { COLORS } from '../theme.js';
import { SERVICE_NAME, SERVICE_SLOGAN } from '../utils/constants.js';
import { MOBILE_WIDTH } from './app-layout.jsx';
import Mascot from './mascot.jsx';

/** 로그인 / 회원가입 공통 화면 틀 – 캐릭터 + 로고 */
function AuthShell({ children, mood = 'happy' }) {
  return (
    <Box sx={ { minHeight: '100vh', background: `linear-gradient(180deg, ${COLORS.orangeSoft} 0%, ${COLORS.yellowSoft} 45%, ${COLORS.cream} 100%)` } }>
      <Box sx={ { maxWidth: MOBILE_WIDTH, mx: 'auto', px: 3, pt: 6, pb: 4 } }>
        <Box component={ RouterLink } to="/" sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', mb: 3 } }>
          <Box sx={ { position: 'relative' } }>
            <Mascot size={ 118 } mood={ mood } />
            <Box sx={ { position: 'absolute', left: -26, top: 10, fontSize: 26, transform: 'rotate(-12deg)' } }>📚</Box>
            <Box sx={ { position: 'absolute', right: -22, top: 0, fontSize: 22 } }>✨</Box>
          </Box>
          <Typography variant="h3" sx={ { color: COLORS.orangeDeep, mt: 1.5, fontSize: 40 } }>{ SERVICE_NAME }</Typography>
          <Typography sx={ { color: COLORS.brownSoft } }>{ SERVICE_SLOGAN }</Typography>
        </Box>
        { children }
      </Box>
    </Box>
  );
}

export default AuthShell;
