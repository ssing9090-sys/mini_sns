import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import BookCover from '../components/book-cover.jsx';
import BookDialog from '../components/book-dialog.jsx';
import EmptyState from '../components/empty-state.jsx';
import { COLORS } from '../theme.js';
import { searchBooks } from '../utils/api.js';
import { GENRE_EMOJI, GENRES } from '../utils/constants.js';

/** 도서 검색 페이지 – 검색 후 책장에 담기 */
function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchBooks(keyword).then(({ data }) => {
        setResults(data ?? []);
        setIsSearching(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const visible = genre ? results.filter((b) => b.genre === genre) : results;

  return (
    <Box sx={ { px: 2, pt: 2 } }>
      <TextField
        autoFocus
        placeholder="책 제목이나 저자를 검색해보세요"
        value={ keyword }
        onChange={ (e) => setKeyword(e.target.value) }
        slotProps={ {
          input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> },
          htmlInput: { 'aria-label': '도서 검색' },
        } }
      />
      <Box className="hide-scrollbar" sx={ { display: 'flex', gap: 1, overflowX: 'auto', py: 1.5 } }>
        <Chip label="전체" onClick={ () => setGenre('') } sx={ { bgcolor: !genre ? COLORS.orange : '#fff', color: !genre ? '#fff' : COLORS.brown, height: 34 } } />
        { GENRES.map((g) => (
          <Chip key={ g } label={ `${GENRE_EMOJI[g]} ${g}` } onClick={ () => setGenre(g) } sx={ { bgcolor: genre === g ? COLORS.orange : '#fff', color: genre === g ? '#fff' : COLORS.brown, height: 34 } } />
        )) }
      </Box>
      { !isSearching && visible.length === 0 ? (
        <EmptyState title="찾는 책이 없어요" description="다른 검색어로 찾아보세요. 후기 쓰기에서 직접 등록할 수도 있어요!" />
      ) : (
        <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, opacity: isSearching ? 0.5 : 1 } }>
          { visible.map((b) => (
            <Box key={ b.id } sx={ { textAlign: 'center' } }>
              <Box sx={ { display: 'flex', justifyContent: 'center' } }><BookCover book={ b } width={ 96 } onClick={ () => setSelected(b) } /></Box>
              <Typography sx={ { fontSize: 13.5, fontWeight: 700, mt: 0.75 } } noWrap>{ b.title }</Typography>
              <Typography sx={ { fontSize: 12, color: 'text.secondary' } } noWrap>{ b.author }</Typography>
            </Box>
          )) }
        </Box>
      ) }
      <BookDialog book={ selected } onClose={ () => setSelected(null) } />
    </Box>
  );
}

export default SearchPage;
