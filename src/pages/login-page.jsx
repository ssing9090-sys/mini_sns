import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AuthShell from '../components/auth-shell.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import { supabase } from '../lib/supabase.js';
import { COLORS } from '../theme.js';
import { authErrorMessage } from '../utils/auth-errors.js';

const SOCIAL = [
  { key: 'kakao', label: '카카오로 시작하기', bg: '#FEE500', color: '#191600', icon: '💬' },
  { key: 'google', label: 'Google로 시작하기', bg: '#fff', color: COLORS.brown, icon: '🌐' },
];

/** 로그인 페이지 – 이메일 로그인 + SNS 로그인 */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = location.state?.from ?? '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsSubmitting(false);
    if (err) {
      setError(authErrorMessage(err));
      return;
    }
    toast('다시 만나서 반가워요! 📚');
  };

  /** SNS 로그인 – Supabase 대시보드에서 공급자를 켜기 전까지는 안내만 보여준다 */
  const handleSocial = () => {
    toast('SNS 로그인은 곧 열려요! 지금은 이메일로 시작해주세요 🙏', 'info');
  };

  return (
    <AuthShell mood="wink">
      <Box component="form" onSubmit={ handleSubmit } noValidate sx={ { display: 'flex', flexDirection: 'column', gap: 1.75 } }>
        { error && <Alert severity="error" sx={ { borderRadius: 4 } }>{ error }</Alert> }
        <TextField label="이메일" type="email" autoComplete="email" value={ email } onChange={ (e) => setEmail(e.target.value) } />
        <TextField label="비밀번호" type="password" autoComplete="current-password" value={ password } onChange={ (e) => setPassword(e.target.value) } />
        <Button type="submit" variant="contained" size="large" disabled={ isSubmitting } sx={ { minHeight: 54, fontSize: 18, mt: 0.5 } }>
          { isSubmitting ? <CircularProgress size={ 24 } color="inherit" /> : '로그인' }
        </Button>
      </Box>

      <Divider sx={ { my: 3, color: 'text.secondary', fontSize: 13 } }>또는 SNS로 간편하게</Divider>

      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.25 } }>
        { SOCIAL.map((s) => (
          <Button
            key={ s.key }
            onClick={ handleSocial }
            sx={ { minHeight: 52, bgcolor: s.bg, color: s.color, border: `1px solid ${COLORS.orangeSoft}`, '&:hover': { bgcolor: s.bg, filter: 'brightness(.97)' } } }
          >
            <span style={ { marginRight: 8 } }>{ s.icon }</span>{ s.label }
          </Button>
        )) }
      </Box>

      <Typography align="center" sx={ { mt: 3.5 } }>
        아직 회원이 아니신가요?{ ' ' }
        <Box component={ RouterLink } to="/signup" state={ { from } } sx={ { color: COLORS.orangeDeep, fontWeight: 700 } }>회원가입</Box>
      </Typography>
      <Typography align="center" sx={ { mt: 1.5 } }>
        <Box component={ RouterLink } to="/" sx={ { color: 'text.secondary', fontSize: 14 } }>로그인 없이 둘러보기</Box>
      </Typography>
    </AuthShell>
  );
}

export default LoginPage;
