/** Supabase Auth 오류 메시지를 친절한 한국어로 바꾼다 */
export function authErrorMessage(error) {
  const message = error?.message ?? '';
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 맞지 않아요.';
  if (message.includes('Email not confirmed')) return '메일함에서 이메일 인증을 먼저 완료해주세요.';
  if (message.includes('already registered')) return '이미 가입된 이메일이에요. 로그인해주세요.';
  if (message.includes('Password should be')) return '비밀번호는 6자 이상으로 입력해주세요.';
  if (message.includes('rate limit') || message.includes('security purposes')) return '요청이 많아요. 잠시 후 다시 시도해주세요.';
  if (message.includes('invalid') && message.includes('mail')) return '올바른 이메일 주소를 입력해주세요.';
  return '문제가 생겼어요. 잠시 후 다시 시도해주세요.';
}
