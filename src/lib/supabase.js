import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트
 * - URL / 키는 .env(로컬) 또는 GitHub Secrets(배포) 환경변수로만 주입한다.
 * - HashRouter(#/경로) 와 충돌하지 않도록 인증 콜백은 PKCE(?code=) 방식을 사용한다.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { flowType: 'pkce' } },
);
