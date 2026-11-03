import { useEffect, useState } from 'react';

import { fetchBooks } from '../utils/api.js';

let cache = null;

/** 전체 도서 목록 (한 번 불러오면 메모리에 보관) */
export function useBooks() {
  const [books, setBooks] = useState(cache ?? []);
  const [isLoading, setIsLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let ignore = false;
    fetchBooks().then(({ data }) => {
      if (ignore) return;
      cache = data ?? [];
      setBooks(cache);
      setIsLoading(false);
    });
    return () => { ignore = true; };
  }, []);

  return { books, isLoading };
}

/** 새 책을 등록한 뒤 캐시에 추가 */
export function addBookToCache(book) {
  if (cache) cache = [...cache, book];
}
