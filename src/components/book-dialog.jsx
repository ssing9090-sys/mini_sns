import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import { COLORS } from '../theme.js';
import { saveToShelf } from '../utils/api.js';
import { READING_STATUS } from '../utils/constants.js';
import BookCover from './book-cover.jsx';

/**
 * 도서 상세 팝업 – 책 정보 + "내 책장에 담기"
 * @param {{ book: object|null, onClose: function, reasons?: string[] }} props
 */
function BookDialog({ book, onClose, reasons = [] }) {
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [savingStatus, setSavingStatus] = useState('');

  const handleSave = async (status) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    setSavingStatus(status);
    const { error } = await saveToShelf(profile.id, book.id, status);
    setSavingStatus('');
    if (error) toast('책장에 담지 못했어요. 다시 시도해주세요.', 'error');
    else toast(`'${READING_STATUS[status].label}' 책장에 담았어요 ${READING_STATUS[status].emoji}`);
  };

  return (
    <Dialog
      open={ Boolean(book) }
      onClose={ onClose }
      fullWidth
      maxWidth="xs"
      slotProps={ { paper: { sx: { borderRadius: '28px', m: 2, bgcolor: COLORS.cream } } } }
    >
      { book && (
        <Box sx={ { p: 3, position: 'relative' } }>
          <IconButton aria-label="닫기" onClick={ onClose } sx={ { position: 'absolute', right: 10, top: 10 } }>
            <CloseRoundedIcon />
          </IconButton>
          <Box sx={ { display: 'flex', justifyContent: 'center', mb: 2 } }>
            <BookCover book={ book } width={ 120 } />
          </Box>
          <Typography variant="h5" align="center">{ book.title }</Typography>
          <Typography align="center" color="text.secondary" sx={ { mb: 1 } }>
            { book.author }{ book.publisher ? ` · ${book.publisher}` : '' }
          </Typography>
          <Box sx={ { display: 'flex', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap', mb: 2 } }>
            <Chip size="small" label={ book.genre } sx={ { bgcolor: COLORS.yellow } } />
            { book.moods.slice(0, 2).map((m) => <Chip key={ m } size="small" label={ m } variant="outlined" />) }
          </Box>
          { book.recommend_reason && (
            <Box sx={ { bgcolor: COLORS.orangeSoft, borderRadius: 3, p: 1.5, mb: 1.5, textAlign: 'center' } }>
              <Typography sx={ { fontWeight: 700 } }>💬 { book.recommend_reason }</Typography>
            </Box>
          ) }
          { reasons.length > 0 && (
            <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 1.5 } }>
              { reasons.map((r) => <Chip key={ r } size="small" label={ `✓ ${r}` } sx={ { bgcolor: '#fff' } } />) }
            </Box>
          ) }
          { book.description && (
            <Typography variant="body2" sx={ { lineHeight: 1.7, mb: 2.5 } }>{ book.description }</Typography>
          ) }
          <Typography variant="subtitle2" sx={ { mb: 1, fontWeight: 700 } }>📚 내 책장에 담기</Typography>
          <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 } }>
            { Object.entries(READING_STATUS).map(([status, info]) => (
              <Button
                key={ status }
                variant="contained"
                disabled={ Boolean(savingStatus) }
                onClick={ () => handleSave(status) }
                sx={ { bgcolor: info.color, color: COLORS.brown, flexDirection: 'column', py: 1, borderRadius: 4, fontSize: 13, '&:hover': { bgcolor: info.color, filter: 'brightness(.95)' } } }
              >
                <span style={ { fontSize: 20 } }>{ info.emoji }</span>
                { info.label }
              </Button>
            )) }
          </Box>
        </Box>
      ) }
    </Dialog>
  );
}

export default BookDialog;
