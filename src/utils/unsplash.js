/**
 * 게시물 분위기 이미지 가져오기
 * - VITE_UNSPLASH_ACCESS_KEY 가 있으면 Unsplash Search API 로 실시간 검색
 * - 없거나 요청이 실패하면, 미리 골라둔 Unsplash 독서 사진 중 무작위로 보여준다.
 */

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const PER_PAGE = 9;

const FALLBACK_IDS = [
  '1512820790803-83ca734da794', '1495446815901-a7297e633e8d', '1481627834876-b7833e8f5570',
  '1524995997946-a1c2e315a42f', '1507842217343-583bb7270b66', '1544947950-fa07a98d237f',
  '1519682337058-a94d519337bc', '1506880018603-83d5b814b5a6', '1532012197267-da84d127e765',
  '1497633762265-9d179a990aa6', '1476275466078-4007374efbbe', '1550399105-c4db5fb85c18',
  '1474932430478-367dbb6832c1', '1513475382585-d06e58bcb0e0', '1543002588-bfa74002ed7e',
  '1516979187457-637abb4f9353', '1589998059171-988d887df646', '1491841573634-28140fc7ced7',
  '1526243741027-444d633d7365', '1457369804613-52c61a468e7d', '1490633874781-1c63cc424610',
  '1535905557558-afc4877a26fc', '1509266272358-7701da638078', '1521587760476-6c12a4b040da',
  '1528207776546-365bb710ee93', '1515098506762-79e1384e9d8e', '1471970471555-19d4b113e9ed',
  '1456513080510-7bf3a84b82f8', '1510172951991-856a654063f9', '1532153975070-2e9ab71f1b14',
  '1511108690759-009324a90311', '1495640388908-05fa85288e61',
];

const SEARCH_WORDS = ['book reading', 'cozy reading', 'library', 'book coffee', 'bookshelf'];

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fallbackImages() {
  return shuffle(FALLBACK_IDS).slice(0, PER_PAGE).map((id) => ({
    id,
    url: `https://images.unsplash.com/photo-${id}?w=1080&q=80&auto=format&fit=crop`,
    alt: '독서 분위기 사진',
  }));
}

/** @returns {Promise<{ id: string, url: string, alt: string }[]>} */
export async function fetchMoodImages(keyword = '') {
  if (!ACCESS_KEY) return fallbackImages();
  try {
    const query = keyword || SEARCH_WORDS[Math.floor(Math.random() * SEARCH_WORDS.length)];
    const page = Math.ceil(Math.random() * 5);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${PER_PAGE}&page=${page}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } },
    );
    if (!res.ok) throw new Error('unsplash');
    const data = await res.json();
    if (!data.results?.length) return fallbackImages();
    return data.results.map((r) => ({
      id: r.id,
      url: `${r.urls.raw}&w=1080&q=80&auto=format&fit=crop`,
      alt: r.alt_description || '독서 분위기 사진',
    }));
  } catch {
    return fallbackImages();
  }
}
