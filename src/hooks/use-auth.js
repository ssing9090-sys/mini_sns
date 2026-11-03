import { useContext } from 'react';

import { AuthContext } from '../utils/auth-context.js';

/**
 * 로그인 상태를 가져오는 훅
 * @returns {{ user: object|null, profile: object|null, isLoading: boolean, refreshProfile: function, signOut: function }}
 */
export function useAuth() {
  return useContext(AuthContext);
}
