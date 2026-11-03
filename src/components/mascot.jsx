import Box from '@mui/material/Box';

import { COLORS } from '../theme.js';

/**
 * 북냠냠 마스코트 "냠냠이" – 책 모양의 귀여운 캐릭터 (SVG)
 * @param {{ size?: number, mood?: 'happy'|'wink'|'think'|'wow', color?: string, badge?: string }} props
 */
function Mascot({ size = 96, mood = 'happy', color = COLORS.orange, badge }) {
  const eyes = {
    happy: (
      <>
        <path d="M34 50q4-5 8 0" stroke={ COLORS.brown } strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M58 50q4-5 8 0" stroke={ COLORS.brown } strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
    wink: (
      <>
        <circle cx="38" cy="49" r="4" fill={ COLORS.brown } />
        <path d="M58 50q4-5 8 0" stroke={ COLORS.brown } strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
    think: (
      <>
        <circle cx="38" cy="49" r="4" fill={ COLORS.brown } />
        <circle cx="62" cy="49" r="4" fill={ COLORS.brown } />
      </>
    ),
    wow: (
      <>
        <circle cx="38" cy="49" r="5" fill={ COLORS.brown } />
        <circle cx="62" cy="49" r="5" fill={ COLORS.brown } />
        <circle cx="39.5" cy="47.5" r="1.6" fill="#fff" />
        <circle cx="63.5" cy="47.5" r="1.6" fill="#fff" />
      </>
    ),
  };
  const mouth = {
    happy: <path d="M43 60q7 8 14 0" stroke={ COLORS.brown } strokeWidth="3" fill="#FF8C8C" strokeLinecap="round" />,
    wink: <path d="M43 60q7 7 14 0" stroke={ COLORS.brown } strokeWidth="3" fill="none" strokeLinecap="round" />,
    think: <path d="M45 62h10" stroke={ COLORS.brown } strokeWidth="3" strokeLinecap="round" />,
    wow: <ellipse cx="50" cy="63" rx="4.5" ry="5.5" fill={ COLORS.brown } />,
  };

  return (
    <Box sx={ { position: 'relative', width: size, height: size, flexShrink: 0 } }>
      <svg viewBox="0 0 100 100" width={ size } height={ size } role="img" aria-label="냠냠이 캐릭터">
        {/* 팔 */}
        <path d="M14 58q-8 2-7 10" stroke={ COLORS.brown } strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M86 58q8 2 7 10" stroke={ COLORS.brown } strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* 다리 */}
        <path d="M38 88v7M62 88v7" stroke={ COLORS.brown } strokeWidth="3" strokeLinecap="round" />
        {/* 책 표지 */}
        <rect x="14" y="16" width="72" height="74" rx="14" fill={ color } />
        <rect x="14" y="16" width="10" height="74" rx="5" fill={ COLORS.brown } opacity="0.18" />
        {/* 책갈피 */}
        <path d="M66 16v16l5-4 5 4V16z" fill={ COLORS.pink } />
        {/* 속지 */}
        <rect x="26" y="26" width="52" height="56" rx="10" fill={ COLORS.yellowSoft } />
        { eyes[mood] }
        <ellipse cx="31" cy="58" rx="5" ry="3" fill={ COLORS.pink } opacity="0.6" />
        <ellipse cx="69" cy="58" rx="5" ry="3" fill={ COLORS.pink } opacity="0.6" />
        { mouth[mood] }
      </svg>
      { badge && (
        <Box
          sx={ {
            position: 'absolute', right: -4, top: -4, fontSize: size * 0.3,
            bgcolor: '#fff', borderRadius: '50%', width: size * 0.42, height: size * 0.42,
            display: 'grid', placeItems: 'center', boxShadow: '0 4px 10px rgba(240,135,90,.25)',
          } }
        >
          { badge }
        </Box>
      ) }
    </Box>
  );
}

export default Mascot;
