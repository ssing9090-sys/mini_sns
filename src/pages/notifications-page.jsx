import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import EmptyState from '../components/empty-state.jsx';
import Loading from '../components/loading.jsx';
import UserAvatar from '../components/user-avatar.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { COLORS } from '../theme.js';
import { fetchNotifications } from '../utils/api.js';
import { timeAgo } from '../utils/format.js';

/** 알림 문구 */
function describe(item) {
  const name = item.actor?.display_name ?? '누군가';
  if (item.type === 'like') return { icon: '❤️', text: `${name}님이 '${item.post.book?.title}' 후기를 좋아해요` };
  if (item.type === 'comment') return { icon: '💬', text: `${name}님의 댓글: ${item.content}` };
  return { icon: '🤝', text: `${name}님이 회원님을 팔로우했어요` };
}

/** 알림 페이지 – 내 후기에 달린 좋아요·댓글, 새 팔로워 */
function NotificationsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications(profile.id).then(({ data }) => {
      setItems(data);
      setIsLoading(false);
    });
  }, [profile.id]);

  if (isLoading) return <Loading />;

  return (
    <Box sx={ { px: 2, pt: 2.5 } }>
      <Typography variant="h5" sx={ { mb: 2, fontSize: 22 } }>🔔 알림</Typography>
      { items.length === 0 ? (
        <EmptyState title="아직 새 알림이 없어요" description="후기를 쓰면 친구들의 하트와 댓글이 여기에 모여요" mood="wink" />
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
          { items.map((item) => {
            const { icon, text } = describe(item);
            return (
              <Paper
                key={ item.key }
                elevation={ 0 }
                onClick={ () => item.post && navigate(`/posts/${item.post.id}`) }
                sx={ { p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, border: `1px solid ${COLORS.orangeSoft}`, cursor: item.post ? 'pointer' : 'default' } }
              >
                <Box sx={ { position: 'relative' } }>
                  <UserAvatar user={ item.actor } size={ 42 } />
                  <Box sx={ { position: 'absolute', right: -4, bottom: -4, fontSize: 14 } }>{ icon }</Box>
                </Box>
                <Box sx={ { flex: 1, minWidth: 0 } }>
                  <Typography sx={ { fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }>{ text }</Typography>
                  <Typography sx={ { fontSize: 12, color: 'text.secondary' } }>{ timeAgo(item.created_at) }</Typography>
                </Box>
              </Paper>
            );
          }) }
        </Box>
      ) }
    </Box>
  );
}

export default NotificationsPage;
