/**
 * 규칙 기반 맞춤 도서 추천 (AI 추천 영역)
 * - 각 도서에 저장된 감정 / 고민 / 목적 / MBTI 기질 / 장르 태그와
 *   사용자의 선택이 얼마나 겹치는지 점수를 매겨 정렬합니다.
 */

const WEIGHTS = { mood: 3, concern: 3, purpose: 2, mbti: 1.5, genre: 2 };

/** MBTI 16유형 → 기질 4그룹 (NF, NT, SJ, SP) */
export function mbtiTemperament(mbti) {
  if (!mbti || mbti.length !== 4) return null;
  const [, sn, tf, jp] = mbti;
  if (sn === 'N') return tf === 'F' ? 'NF' : 'NT';
  return jp === 'J' ? 'SJ' : 'SP';
}

/** 한 권의 점수와 일치한 이유 목록 */
function scoreBook(book, answers) {
  const reasons = [];
  let score = 0;
  if (answers.mood && book.moods.includes(answers.mood)) {
    score += WEIGHTS.mood;
    reasons.push(`'${answers.mood}' 마음에 딱`);
  }
  if (answers.concern && book.concerns.includes(answers.concern)) {
    score += WEIGHTS.concern;
    reasons.push(`${answers.concern} 고민에 도움`);
  }
  if (answers.purpose && book.purposes.includes(answers.purpose)) {
    score += WEIGHTS.purpose;
    reasons.push(`${answers.purpose} 목적에 딱`);
  }
  const temperament = mbtiTemperament(answers.mbti);
  if (temperament && book.mbti.includes(temperament)) {
    score += WEIGHTS.mbti;
    reasons.push(`${answers.mbti}와 찰떡궁합`);
  }
  if (answers.genre && book.genre === answers.genre) {
    score += WEIGHTS.genre;
    reasons.push(`좋아하는 ${book.genre}`);
  }
  if (book.is_featured) score += 0.3;
  return { score, reasons };
}

/** 조건에 맞는 도서 n권 (점수 높은 순) */
export function recommendBooks(books, answers, n = 3) {
  return books
    .map((book) => ({ book, ...scoreBook(book, answers) }))
    .sort((a, b) => b.score - a.score || a.book.id - b.book.id)
    .slice(0, n);
}

/** 감정 하나에 맞는 도서 */
export function booksForMood(books, mood, n = 4) {
  return recommendBooks(books, { mood }, n).filter((r) => r.score > 0.5).map((r) => r.book);
}

/** 날짜 + 사용자 기준으로 매일 바뀌는 오늘의 추천 1권 */
export function todayPick(books, seedText = '') {
  if (!books.length) return null;
  const key = `${new Date().toDateString()}-${seedText}`;
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return books[hash % books.length];
}

/** 비슷한 주제의 책 (태그 겹침 + 같은 장르) */
export function similarBooks(target, books, n = 4) {
  const overlap = (a, b) => a.filter((x) => b.includes(x)).length;
  return books
    .filter((b) => b.id !== target.id)
    .map((b) => ({
      book: b,
      score: overlap(b.moods, target.moods) + overlap(b.concerns, target.concerns) * 1.5
        + overlap(b.purposes, target.purposes) + (b.genre === target.genre ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((r) => r.book);
}
