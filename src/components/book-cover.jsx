import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { COLORS } from '../theme.js';

/**
 * 책 표지
 * - cover_url 이 있으면 이미지, 없으면 파스텔 색상 + 이모지로 귀여운 표지를 그린다.
 * @param {{ book: object, width?: number, onClick?: function }} props
 */
function BookCover({ book, width = 96, onClick }) {
  const height = Math.round(width * 1.42);
  const small = width < 80;

  return (
    <Box
      onClick={ onClick }
      role={ onClick ? 'button' : undefined }
      aria-label={ onClick ? `${book.title} 자세히 보기` : undefined }
      sx={ {
        width, height, flexShrink: 0, borderRadius: small ? '8px' : '12px',
        overflow: 'hidden', position: 'relative', cursor: onClick ? 'pointer' : 'default',
        boxShadow: '4px 6px 14px rgba(91,58,41,.18)',
        bgcolor: book.cover_color || COLORS.orangeSoft,
        transition: 'transform .15s',
        '&:active': onClick ? { transform: 'scale(.96)' } : undefined,
      } }
    >
      { book.cover_url ? (
        <Box component="img" src={ book.cover_url } alt={ book.title } sx={ { width: 1, height: 1, objectFit: 'cover' } } />
      ) : (
        <>
          {/* 책등 그림자 */}
          <Box sx={ { position: 'absolute', left: 0, top: 0, bottom: 0, width: '9%', bgcolor: 'rgba(91,58,41,.12)' } } />
          <Box
            sx={ {
              position: 'absolute', inset: 0, pl: '14%', pr: '8%', py: small ? 0.75 : 1.5,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            } }
          >
            <Typography
              sx={ {
                fontFamily: "'Jua', sans-serif", color: COLORS.brown,
                fontSize: Math.max(9, width * 0.12), lineHeight: 1.25, wordBreak: 'keep-all',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              } }
            >
              { book.title }
            </Typography>
            <Box sx={ { fontSize: width * 0.3, textAlign: 'center', lineHeight: 1 } }>{ book.cover_emoji || '📖' }</Box>
            { !small && (
              <Typography sx={ { fontSize: Math.max(8, width * 0.085), color: COLORS.brownSoft, textAlign: 'right' } } noWrap>
                { book.author }
              </Typography>
            ) }
          </Box>
        </>
      ) }
    </Box>
  );
}

export default BookCover;
