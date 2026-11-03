import { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { COLORS } from '../theme.js';
import { READING_STATUS } from '../utils/constants.js';
import BookCover from './book-cover.jsx';

const PER_ROW = 4;

/**
 * 책장 모양 독서 기록 UI – 나무 선반 위에 책이 4권씩 꽂혀 있다.
 * @param {{ items: object[], onChangeStatus: function, onRemove: function, onOpen: function }} props
 */
function Bookshelf({ items, onChangeStatus, onRemove, onOpen }) {
  const [menu, setMenu] = useState({ anchor: null, item: null });
  const rows = [];
  for (let i = 0; i < Math.max(items.length, 1); i += PER_ROW) rows.push(items.slice(i, i + PER_ROW));

  const close = () => setMenu({ anchor: null, item: null });

  return (
    <Box sx={ { bgcolor: '#FBEBDC', borderRadius: 5, p: 1.5, pt: 2, border: `3px solid ${COLORS.shelf}` } }>
      { rows.map((row, idx) => (
        <Box key={ idx } sx={ { mb: idx === rows.length - 1 ? 0 : 2.5 } }>
          <Box sx={ { display: 'grid', gridTemplateColumns: `repeat(${PER_ROW}, 1fr)`, gap: 1, alignItems: 'end', minHeight: 110, px: 0.5 } }>
            { row.map((item) => (
              <Box
                key={ item.id }
                onClick={ (e) => setMenu({ anchor: e.currentTarget, item }) }
                sx={ { position: 'relative', display: 'flex', justifyContent: 'center', cursor: 'pointer' } }
              >
                <BookCover book={ item.book } width={ 72 } />
                <Box sx={ { position: 'absolute', top: -8, right: 2, fontSize: 16, bgcolor: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.12)' } }>
                  { READING_STATUS[item.reading_status].emoji }
                </Box>
              </Box>
            )) }
          </Box>
          {/* 나무 선반 */}
          <Box sx={ { height: 12, mt: 0.5, borderRadius: 2, background: `linear-gradient(180deg, ${COLORS.shelf}, #D49E6A)`, boxShadow: '0 4px 6px rgba(91,58,41,.2)' } } />
        </Box>
      )) }

      <Menu anchorEl={ menu.anchor } open={ Boolean(menu.anchor) } onClose={ close }>
        { menu.item && (
          <Box sx={ { px: 2, py: 0.5, maxWidth: 220 } }>
            <Typography sx={ { fontWeight: 700 } } noWrap>{ menu.item.book.title }</Typography>
          </Box>
        ) }
        <MenuItem onClick={ () => { onOpen(menu.item.book); close(); } }>📖 책 정보 보기</MenuItem>
        <Divider />
        { Object.entries(READING_STATUS).map(([status, info]) => (
          <MenuItem
            key={ status }
            selected={ menu.item?.reading_status === status }
            onClick={ () => { onChangeStatus(menu.item, status); close(); } }
          >
            { info.emoji } { info.label }
          </MenuItem>
        )) }
        <Divider />
        <MenuItem onClick={ () => { onRemove(menu.item); close(); } } sx={ { color: 'error.main' } }>🗑️ 책장에서 빼기</MenuItem>
      </Menu>
    </Box>
  );
}

export default Bookshelf;
