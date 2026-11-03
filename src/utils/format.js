/** "방금 전 / 5분 전 / 3일 전 / 2026.11.03" 형태의 상대 시간 */
export function timeAgo(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return formatDate(value);
}

/** 2026.11.03 */
export function formatDate(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** "#힐링 독서" 같은 입력을 ["힐링", "독서"] 로 정리 */
export function parseHashtags(text) {
  return [...new Set(
    text.split(/[\s,#]+/).map((t) => t.trim()).filter(Boolean).map((t) => t.slice(0, 20)),
  )].slice(0, 10);
}

/** Unsplash 이미지 URL 에 크기 파라미터를 붙인다 */
export function sizedImage(url, width) {
  if (!url) return url;
  if (!url.includes('images.unsplash.com')) return url;
  const u = new URL(url);
  u.searchParams.set('w', String(width));
  u.searchParams.set('q', '80');
  u.searchParams.set('auto', 'format');
  u.searchParams.set('fit', 'crop');
  return u.toString();
}
