import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth.js';
import Loading from './loading.jsx';

/** 로그인이 필요한 페이지 – 로그인 안 되어 있으면 로그인 페이지로 보낸다 */
function RequireAuth({ children }) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={ { from: location.pathname } } />;
  if (!profile) return <Loading text="프로필을 준비하고 있어요" />;
  return children;
}

export default RequireAuth;
