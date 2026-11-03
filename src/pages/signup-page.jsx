import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AuthShell from '../components/auth-shell.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import { supabase } from '../lib/supabase.js';
import { COLORS } from '../theme.js';
import { authErrorMessage } from '../utils/auth-errors.js';

const USERNAME_RULE = /^[a-z0-9_.]{3,20}$/;

/** 회원가입 페이지 */
function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '', passwordCheck: '' });
  const [error, setError] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = location.state?.from ?? '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const update = (key) => (e) => setForm({ ...form, [key]: key === 'username' ? e.target.value.toLowerCase() : e.target.value });

  const validate = () => {
    if (!form.displayName.trim()) return '닉네임을 입력해주세요.';
    if (!USERNAME_RULE.test(form.username)) return '아이디는 영문 소문자·숫자·_·. 3~20자로 입력해주세요.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return '올바른 이메일 주소를 입력해주세요.';
    if (form.password.length < 6) return '비밀번호는 6자 이상으로 입력해주세요.';
    if (form.password !== form.passwordCheck) return '비밀번호가 서로 달라요.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (message) return;

    setIsSubmitting(true);
    const { data: taken } = await supabase.from('sns_users').select('id').eq('username', form.username).maybeSingle();
    if (taken) {
      setIsSubmitting(false);
      setError('이미 사용 중인 아이디예요. 다른 아이디를 골라주세요.');
      return;
    }
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { username: form.username, display_name: form.displayName.trim() },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    });
    setIsSubmitting(false);
    if (err) {
      setError(authErrorMessage(err));
      return;
    }
    if (data.session) {
      toast('가입을 축하해요! 🎉 북냠냠에 오신 걸 환영해요');
    } else {
      setSentEmail(form.email.trim());
    }
  };

  if (sentEmail) {
    return (
      <AuthShell mood="wow">
        <Box sx={ { textAlign: 'center', bgcolor: '#fff', borderRadius: 6, p: 3 } }>
          <Typography variant="h5" sx={ { mb: 1 } }>📮 인증 메일을 보냈어요!</Typography>
          <Typography sx={ { mb: 2, lineHeight: 1.7 } }>
            <b>{ sentEmail }</b> 메일함에서<br />인증 링크를 누르면 가입이 완료돼요.
          </Typography>
          <Button variant="contained" fullWidth onClick={ () => navigate('/login') }>로그인하러 가기</Button>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Typography variant="h5" align="center" sx={ { mb: 2 } }>책친구가 되어주세요 🧡</Typography>
      <Box component="form" onSubmit={ handleSubmit } noValidate sx={ { display: 'flex', flexDirection: 'column', gap: 1.75 } }>
        { error && <Alert severity="error" sx={ { borderRadius: 4 } }>{ error }</Alert> }
        <TextField label="닉네임 (프로필에 보이는 이름)" value={ form.displayName } onChange={ update('displayName') } slotProps={ { htmlInput: { maxLength: 30 } } } />
        <TextField
          label="아이디"
          value={ form.username }
          onChange={ update('username') }
          helperText="영문 소문자, 숫자, _ . 사용 (3~20자)"
          slotProps={ { input: { startAdornment: <InputAdornment position="start">@</InputAdornment> }, htmlInput: { maxLength: 20 } } }
        />
        <TextField label="이메일" type="email" autoComplete="email" value={ form.email } onChange={ update('email') } />
        <TextField label="비밀번호 (6자 이상)" type="password" autoComplete="new-password" value={ form.password } onChange={ update('password') } />
        <TextField label="비밀번호 확인" type="password" autoComplete="new-password" value={ form.passwordCheck } onChange={ update('passwordCheck') } />
        <Button type="submit" variant="contained" size="large" disabled={ isSubmitting } sx={ { minHeight: 54, fontSize: 18, mt: 0.5 } }>
          { isSubmitting ? <CircularProgress size={ 24 } color="inherit" /> : '가입하기' }
        </Button>
      </Box>
      <Typography align="center" sx={ { mt: 3 } }>
        이미 회원이신가요?{ ' ' }
        <Box component={ RouterLink } to="/login" state={ { from } } sx={ { color: COLORS.orangeDeep, fontWeight: 700 } }>로그인</Box>
      </Typography>
    </AuthShell>
  );
}

export default SignupPage;
