import Box from '@mui/material/Box';

import { COLORS } from '../theme.js';

const INK = { stroke: COLORS.brown, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' };
const LINE = { ...INK, fill: 'none' };

/** 표정별 눈 */
const EYES = {
  happy: (
    <>
      <path d="M31 60q6-8 12 0" { ...LINE } />
      <path d="M57 60q6-8 12 0" { ...LINE } />
    </>
  ),
  wink: (
    <>
      <circle cx="37" cy="58" r="4.5" fill={ COLORS.brown } />
      <circle cx="38.6" cy="56.4" r="1.5" fill="#fff" />
      <path d="M57 60q6-8 12 0" { ...LINE } />
    </>
  ),
  think: (
    <>
      <circle cx="37" cy="58" r="4.5" fill={ COLORS.brown } />
      <circle cx="63" cy="58" r="4.5" fill={ COLORS.brown } />
      <circle cx="38" cy="55.8" r="1.6" fill="#fff" />
      <circle cx="64" cy="55.8" r="1.6" fill="#fff" />
    </>
  ),
  wow: (
    <>
      <circle cx="37" cy="58" r="6" fill={ COLORS.brown } />
      <circle cx="63" cy="58" r="6" fill={ COLORS.brown } />
      <circle cx="39" cy="55.8" r="2.2" fill="#fff" />
      <circle cx="65" cy="55.8" r="2.2" fill="#fff" />
      <circle cx="35.4" cy="60.4" r="1.1" fill="#fff" />
      <circle cx="61.4" cy="60.4" r="1.1" fill="#fff" />
    </>
  ),
};

/** 표정별 입 – 기본은 냠냠 먹는 입(앞니 하나) */
const MOUTHS = {
  happy: (
    <>
      <path d="M41 68q9 1 18 0q-1 11-9 11t-9-11z" fill="#E8705F" { ...INK } />
      <path d="M46.5 68.6h7v3.2q-3.5 1.8-7 0z" fill="#fff" />
    </>
  ),
  wink: <path d="M43 70q7 7 14 0" { ...LINE } />,
  think: <path d="M46 73q3-2.5 5.5-1t5-.6" { ...LINE } />,
  wow: <ellipse cx="50" cy="74" rx="4.5" ry="5.5" fill="#E8705F" { ...INK } />,
};

/**
 * 마스코트 "냠냠이" – 펼친 책을 머리에 쓴 동글동글한 책벌레 (SVG)
 * 표지에는 작은 하트가 있고, 이마에는 책갈피가 달려 있어요.
 * @param {{ size?: number, mood?: 'happy'|'wink'|'think'|'wow', color?: string, badge?: string }} props
 */
function Mascot({ size = 96, mood = 'happy', color = COLORS.orange, badge }) {
  return (
    <Box sx={ { position: 'relative', width: size, height: size, flexShrink: 0 } }>
      <svg viewBox="0 0 100 100" width={ size } height={ size } role="img" aria-label="냠냠이 캐릭터">
        {/* 발 */}
        <ellipse cx="36" cy="92" rx="9" ry="5" fill={ color } { ...INK } />
        <ellipse cx="64" cy="92" rx="9" ry="5" fill={ color } { ...INK } />
        {/* 팔 */}
        <path d="M18 66q-9 3-8 11q6 3 11-3z" fill={ COLORS.yellowSoft } { ...INK } />
        <path d="M82 66q9 3 8 11q-6 3-11-3z" fill={ COLORS.yellowSoft } { ...INK } />
        {/* 몸통 */}
        <path d="M50 28c21 0 34 15 34 36c0 19-14 28-34 28S16 83 16 64c0-21 13-36 34-36z" fill={ COLORS.yellowSoft } { ...INK } />
        {/* 볼 */}
        <ellipse cx="26" cy="69" rx="6" ry="4" fill={ COLORS.pink } opacity="0.7" />
        <ellipse cx="74" cy="69" rx="6" ry="4" fill={ COLORS.pink } opacity="0.7" />
        { EYES[mood] }
        { MOUTHS[mood] }
        {/* 속지 */}
        <path d="M50 18L10 41q1 10 9 11q16-10 31-13q15 3 31 13q8-1 9-11z" fill="#fff" { ...INK } />
        <path d="M15 47q16-10 35-14" { ...LINE } strokeWidth="1.6" opacity="0.45" />
        <path d="M85 47q-16-10-35-14" { ...LINE } strokeWidth="1.6" opacity="0.45" />
        {/* 책 표지 */}
        <path d="M50 8L9 31q-5 3-3 8l1 3q2 4 6 2l37-19z" fill={ color } { ...INK } />
        <path d="M50 8l41 23q5 3 3 8l-1 3q-2 4-6 2L50 25z" fill={ color } { ...INK } />
        {/* 표지 하트와 제목 줄 */}
        <path d="M0 5C-8-1-3-6 0-2C3-6 8-1 0 5z" transform="translate(29 28) rotate(-30)" fill={ COLORS.pink } />
        <path d="M60 19l14 7.8" { ...LINE } strokeWidth="2.4" opacity="0.55" />
        <path d="M61 25l8 4.4" { ...LINE } strokeWidth="2.4" opacity="0.55" />
        {/* 책갈피 */}
        <path d="M45 37v13l5-3.5l5 3.5V37z" fill={ COLORS.pink } { ...INK } strokeWidth="2.4" />
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
