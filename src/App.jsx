import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AppLayout from './components/app-layout.jsx';
import RequireAuth from './components/require-auth.jsx';
import FeedPage from './pages/feed-page.jsx';
import FindBookPage from './pages/find-book-page.jsx';
import HomePage from './pages/home-page.jsx';
import LoginPage from './pages/login-page.jsx';
import MyPage from './pages/my-page.jsx';
import NotificationsPage from './pages/notifications-page.jsx';
import PostDetailPage from './pages/post-detail-page.jsx';
import PostWritePage from './pages/post-write-page.jsx';
import SearchPage from './pages/search-page.jsx';
import SignupPage from './pages/signup-page.jsx';

/** 페이지가 바뀌면 맨 위로 스크롤 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** 라우팅 */
function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={ <LoginPage /> } />
        <Route path="/signup" element={ <SignupPage /> } />
        <Route element={ <AppLayout /> }>
          <Route path="/" element={ <HomePage /> } />
          <Route path="/feed" element={ <FeedPage /> } />
          <Route path="/posts/:postId" element={ <PostDetailPage /> } />
          <Route path="/find" element={ <FindBookPage /> } />
          <Route path="/search" element={ <SearchPage /> } />
          <Route path="/write" element={ <RequireAuth><PostWritePage /></RequireAuth> } />
          <Route path="/posts/:postId/edit" element={ <RequireAuth><PostWritePage /></RequireAuth> } />
          <Route path="/my" element={ <RequireAuth><MyPage /></RequireAuth> } />
          <Route path="/notifications" element={ <RequireAuth><NotificationsPage /></RequireAuth> } />
          <Route path="*" element={ <Navigate to="/" replace /> } />
        </Route>
      </Routes>
    </>
  );
}

export default App;
