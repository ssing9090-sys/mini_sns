import Avatar from '@mui/material/Avatar';

import { COLORS } from '../theme.js';

/**
 * 사용자 프로필 사진
 * - avatar_url 이 "emoji:🐻" 이면 이모지 아바타, URL 이면 이미지, 없으면 이름 첫 글자
 */
function UserAvatar({ user, size = 36, onClick }) {
  const url = user?.avatar_url ?? '';
  const isEmoji = url.startsWith('emoji:');
  return (
    <Avatar
      onClick={ onClick }
      src={ !isEmoji && url ? url : undefined }
      alt={ user?.display_name ?? '사용자' }
      sx={ {
        width: size, height: size, fontSize: isEmoji ? size * 0.55 : size * 0.42,
        bgcolor: COLORS.yellowSoft, color: COLORS.brown, border: `2px solid ${COLORS.orangeSoft}`,
        cursor: onClick ? 'pointer' : 'default', fontFamily: "'Jua', sans-serif",
      } }
    >
      { isEmoji ? url.slice(6) : (user?.display_name?.[0] ?? '🙂') }
    </Avatar>
  );
}

export default UserAvatar;
