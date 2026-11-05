/** 서비스 기본 정보 */
export const SERVICE_NAME = '사랑은 유행';
export const SERVICE_SLOGAN = '지금 나에게 필요한 책, 냠냠 골라줄게요';

/** 감정 버튼 */
export const MOODS = [
  { value: '행복해요', emoji: '😊', color: '#FFE58F' },
  { value: '설레요', emoji: '🥰', color: '#FFD0DC' },
  { value: '지쳤어요', emoji: '😪', color: '#FFE4D2' },
  { value: '우울해요', emoji: '🥲', color: '#D6E4FF' },
  { value: '불안해요', emoji: '😰', color: '#E4D4F0' },
  { value: '외로워요', emoji: '🫧', color: '#CDEFE3' },
];

/** 고민 및 관심사 */
export const CONCERNS = [
  { value: '진로', emoji: '🧭' },
  { value: '인간관계', emoji: '🤝' },
  { value: '자존감', emoji: '🌻' },
  { value: '연애', emoji: '💌' },
  { value: '돈', emoji: '💰' },
  { value: '공부', emoji: '✏️' },
  { value: '건강', emoji: '🍀' },
];

/** 장르 */
export const GENRES = ['소설', '에세이', '자기계발', '인문', '과학', '경제', '시'];

/** 장르별 이모지 */
export const GENRE_EMOJI = {
  소설: '📕', 에세이: '☕', 자기계발: '🌱', 인문: '🦉', 과학: '🔭', 경제: '💰', 시: '🌸',
};

/** 독서 목적 */
export const PURPOSES = [
  { value: '위로', emoji: '🫶', label: '위로받고 싶어요' },
  { value: '성장', emoji: '🌱', label: '성장하고 싶어요' },
  { value: '재미', emoji: '🎢', label: '재밌게 읽고 싶어요' },
  { value: '지식', emoji: '🧠', label: '지식을 쌓고 싶어요' },
  { value: '휴식', emoji: '🛋️', label: '쉬어가고 싶어요' },
];

/** MBTI 16유형 */
export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

/** 책장 상태 */
export const READING_STATUS = {
  want: { label: '읽고 싶어요', emoji: '💭', color: '#FFF0B3' },
  reading: { label: '읽는 중', emoji: '📖', color: '#FFD9C2' },
  done: { label: '완독', emoji: '🏅', color: '#CDEFE3' },
};

/** 프로필 아바타 프리셋 (avatar_url 에 "emoji:🐻" 형태로 저장) */
export const AVATAR_PRESETS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🐥', '🐹', '🦉', '🐧', '🐨', '🐸'];
