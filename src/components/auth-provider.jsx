import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase.js';
import { createProfile, fetchProfileByAuthId } from '../utils/api.js';
import { AuthContext } from '../utils/auth-context.js';

/**
 * 로그인 상태 관리
 * - Supabase Auth 세션을 구독하고, 로그인한 사용자의 sns_users 프로필을 불러온다.
 * - 프로필이 아직 없으면(첫 로그인) 자동으로 만든다.
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    let { data } = await fetchProfileByAuthId(authUser.id);
    if (!data) ({ data } = await createProfile(authUser));
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const authUser = data.session?.user ?? null;
      if (!isMounted) return;
      setUser(authUser);
      await loadProfile(authUser);
      if (isMounted) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // 콜백 안에서 바로 Supabase 를 호출하면 교착될 수 있어 다음 틱으로 미룬다.
        setTimeout(() => loadProfile(authUser), 0);
      }
    });
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    refreshProfile: () => loadProfile(user),
    setProfile,
    signOut: () => supabase.auth.signOut(),
  }), [user, profile, isLoading, loadProfile]);

  return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}

export default AuthProvider;
