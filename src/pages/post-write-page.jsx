import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import BookCover from '../components/book-cover.jsx';
import Loading from '../components/loading.jsx';
import { MOBILE_WIDTH } from '../components/app-layout.jsx';
import RatingStars from '../components/rating-stars.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { addBookToCache } from '../hooks/use-books.js';
import { useToast } from '../hooks/use-toast.js';
import { COLORS } from '../theme.js';
import { createBook, createPost, deletePost, fetchPost, searchBooks, updatePost } from '../utils/api.js';
import { GENRES } from '../utils/constants.js';
import { parseHashtags, sizedImage } from '../utils/format.js';
import { fetchMoodImages } from '../utils/unsplash.js';

const RATING_TEXT = ['', '별로였어요 😢', '그저 그랬어요 🙂', '괜찮았어요 😊', '좋았어요 😍', '인생 책이에요 🤩'];
const COVER_COLORS = ['#FFD1B3', '#FFE7A3', '#FFD0DC', '#C9D7FF', '#C7E8C2', '#E4D4F0'];

/** 단계 제목 */
function StepTitle({ step, title, optional }) {
  return (
    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
      <Box sx={ { width: 26, height: 26, borderRadius: '50%', bgcolor: COLORS.orange, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 } }>
        { step }
      </Box>
      <Typography variant="h6" sx={ { fontSize: 18 } }>{ title }</Typography>
      { optional && <Chip size="small" label="선택" sx={ { bgcolor: COLORS.yellowSoft } } /> }
    </Box>
  );
}

/** 게시물 작성 / 수정 페이지 */
function PostWritePage() {
  const { postId } = useParams();
  const isEdit = Boolean(postId);
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useAuth();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [book, setBook] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [rating, setRating] = useState(0);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBookOpen, setNewBookOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: '소설' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* 수정 모드: 기존 게시물 불러오기 */
  useEffect(() => {
    if (!isEdit || !profile) return;
    fetchPost(postId).then(({ data }) => {
      if (!data || data.user_id !== profile.id) {
        toast('수정할 수 없는 게시물이에요.', 'error');
        navigate('/feed', { replace: true });
        return;
      }
      setBook(data.book);
      setRating(data.rating);
      setCaption(data.caption);
      setTags(data.hashtags ?? []);
      setImageUrl(data.image_url ?? '');
      setIsLoading(false);
    });
  }, [isEdit, postId, profile, navigate, toast]);

  /* 책 검색 (입력 후 0.3초 뒤) */
  useEffect(() => {
    if (book) return undefined;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchBooks(keyword).then(({ data }) => {
        setResults(data ?? []);
        setIsSearching(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, book]);

  /* 분위기 사진 불러오기 */
  const loadImages = useCallback(async () => {
    setIsImageLoading(true);
    setImages(await fetchMoodImages());
    setIsImageLoading(false);
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  const addTags = (text) => {
    const next = parseHashtags(`${tags.join(' ')} ${text}`);
    setTags(next);
    setTagInput('');
  };

  const handleTagKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === ',') {
      event.preventDefault();
      if (tagInput.trim()) addTags(tagInput);
    } else if (event.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleCreateBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      toast('책 제목과 저자를 입력해주세요.', 'error');
      return;
    }
    const { data, error } = await createBook({
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      genre: newBook.genre,
      cover_color: COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
      created_by: profile.id,
    });
    if (error) {
      toast('책을 등록하지 못했어요.', 'error');
      return;
    }
    addBookToCache(data);
    setBook(data);
    setNewBookOpen(false);
    toast('새 책을 등록했어요 📚');
  };

  const validationMessage = !book ? '읽은 책을 골라주세요'
    : !rating ? '별점을 눌러주세요'
      : !caption.trim() ? '독서 후기를 적어주세요' : '';

  const handleSubmit = async () => {
    if (validationMessage) {
      toast(validationMessage, 'error');
      return;
    }
    setIsSubmitting(true);
    const finalTags = tagInput.trim() ? parseHashtags(`${tags.join(' ')} ${tagInput}`) : tags;
    const values = {
      book_id: book.id,
      rating,
      caption: caption.trim(),
      hashtags: finalTags,
      image_url: imageUrl || null,
    };
    const { data, error } = isEdit
      ? await updatePost(postId, values)
      : await createPost({ ...values, user_id: profile.id });
    setIsSubmitting(false);
    if (error) {
      toast('저장하지 못했어요. 다시 시도해주세요.', 'error');
      return;
    }
    toast(isEdit ? '후기를 수정했어요 ✨' : '후기를 등록했어요 🎉');
    navigate(`/posts/${data.id}`, { replace: true });
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    const { error } = await deletePost(postId);
    if (error) {
      toast('삭제하지 못했어요.', 'error');
      return;
    }
    toast('후기를 삭제했어요');
    navigate('/feed', { replace: true });
  };

  if (isLoading) return <Loading />;

  return (
    <Box sx={ { px: 2, pt: 1 } }>
      <Box sx={ { display: 'flex', alignItems: 'center', mb: 2 } }>
        <IconButton aria-label="뒤로 가기" onClick={ () => navigate(-1) }>
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={ { fontSize: 22 } }>{ isEdit ? '독서 후기 수정' : '독서 후기 쓰기' } ✏️</Typography>
      </Box>

      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3.5 } }>
        {/* 1. 책 선택 */}
        <Box>
          <StepTitle step={ 1 } title="읽은 책을 골라주세요" />
          { book ? (
            <Paper elevation={ 0 } sx={ { p: 2, display: 'flex', gap: 2, alignItems: 'center', background: `linear-gradient(135deg, ${COLORS.orangeSoft}, ${COLORS.yellowSoft})` } }>
              <BookCover book={ book } width={ 80 } />
              <Box sx={ { flex: 1, minWidth: 0 } }>
                <Typography variant="h6" sx={ { lineHeight: 1.3 } }>{ book.title }</Typography>
                <Typography variant="body2" color="text.secondary">{ book.author }</Typography>
                <Box sx={ { display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' } }>
                  <Chip size="small" label={ book.genre } sx={ { bgcolor: '#fff' } } />
                  { book.publisher && <Chip size="small" label={ book.publisher } sx={ { bgcolor: '#fff' } } /> }
                </Box>
                { !isEdit && (
                  <Button size="small" onClick={ () => setBook(null) } sx={ { mt: 0.75, minHeight: 32, px: 1 } }>다른 책 고르기</Button>
                ) }
              </Box>
            </Paper>
          ) : (
            <>
              <TextField
                placeholder="책 제목이나 저자를 검색해보세요"
                value={ keyword }
                onChange={ (e) => setKeyword(e.target.value) }
                slotProps={ {
                  input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> },
                  htmlInput: { 'aria-label': '책 검색' },
                } }
              />
              <Box sx={ { mt: 1.5, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, maxHeight: 420, overflowY: 'auto', p: 0.5 } }>
                { isSearching && results.length === 0 && <CircularProgress size={ 24 } sx={ { m: 2 } } /> }
                { results.map((b) => (
                  <Box key={ b.id } onClick={ () => setBook(b) } sx={ { cursor: 'pointer', textAlign: 'center' } }>
                    <Box sx={ { display: 'flex', justifyContent: 'center' } }><BookCover book={ b } width={ 88 } /></Box>
                    <Typography sx={ { fontSize: 13, fontWeight: 700, mt: 0.75 } } noWrap>{ b.title }</Typography>
                    <Typography sx={ { fontSize: 11.5, color: 'text.secondary' } } noWrap>{ b.author }</Typography>
                  </Box>
                )) }
              </Box>
              { !isSearching && results.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={ { py: 2 } }>검색 결과가 없어요</Typography>
              ) }
              <Button fullWidth variant="outlined" onClick={ () => { setNewBook((v) => ({ ...v, title: keyword })); setNewBookOpen(true); } } sx={ { mt: 1.5 } }>
                ➕ 찾는 책이 없나요? 직접 등록하기
              </Button>
            </>
          ) }
        </Box>

        {/* 2. 별점 */}
        <Box>
          <StepTitle step={ 2 } title="별점을 매겨주세요" />
          <Paper elevation={ 0 } sx={ { p: 2, textAlign: 'center', border: `1px solid ${COLORS.orangeSoft}` } }>
            <Box sx={ { '& .MuiRating-root': { fontSize: 48 } } }>
              <RatingStars value={ rating } onChange={ (v) => setRating(v ?? 0) } size="large" />
            </Box>
            <Typography sx={ { fontWeight: 700, minHeight: 24 } }>{ RATING_TEXT[rating] }</Typography>
          </Paper>
        </Box>

        {/* 3. 후기 */}
        <Box>
          <StepTitle step={ 3 } title="독서 후기를 남겨주세요" />
          <TextField
            multiline
            minRows={ 6 }
            placeholder={ '이 책을 읽고 어떤 마음이 들었나요?\n기억에 남는 문장도 좋아요 :)' }
            value={ caption }
            onChange={ (e) => setCaption(e.target.value) }
            helperText={ `${caption.length} / 2000` }
            slotProps={ { htmlInput: { maxLength: 2000, 'aria-label': '독서 후기' }, formHelperText: { sx: { textAlign: 'right' } } } }
          />
        </Box>

        {/* 4. 해시태그 */}
        <Box>
          <StepTitle step={ 4 } title="해시태그" optional />
          <TextField
            placeholder="#힐링 #인생책 (스페이스·엔터로 추가)"
            value={ tagInput }
            onChange={ (e) => setTagInput(e.target.value) }
            onKeyDown={ handleTagKeyDown }
            onBlur={ () => tagInput.trim() && addTags(tagInput) }
            slotProps={ { htmlInput: { 'aria-label': '해시태그 입력' } } }
          />
          { tags.length > 0 && (
            <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 } }>
              { tags.map((t) => (
                <Chip key={ t } label={ `#${t}` } onDelete={ () => setTags(tags.filter((x) => x !== t)) } sx={ { bgcolor: COLORS.yellowSoft, color: COLORS.orangeDeep } } />
              )) }
            </Box>
          ) }
        </Box>

        {/* 5. 분위기 사진 */}
        <Box>
          <Box sx={ { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' } }>
            <StepTitle step={ 5 } title="분위기 사진 고르기" optional />
            <Button size="small" startIcon={ <RefreshRoundedIcon /> } onClick={ loadImages } disabled={ isImageLoading } sx={ { minHeight: 36 } }>
              새로고침
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={ { mt: -1, mb: 1.5 } }>
            Unsplash 의 독서 사진 중 마음에 드는 한 장을 골라주세요. 다시 누르면 선택이 해제돼요.
          </Typography>
          { imageUrl && !images.some((img) => img.url === imageUrl) && (
            <Box sx={ { position: 'relative', mb: 1.5 } }>
              <Box component="img" src={ sizedImage(imageUrl, 600) } alt="선택한 사진" sx={ { width: 1, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 4, outline: `4px solid ${COLORS.orangeDeep}` } } />
              <Chip label="현재 선택된 사진 (탭하여 해제)" onClick={ () => setImageUrl('') } sx={ { position: 'absolute', left: 8, bottom: 8, bgcolor: '#fff' } } />
            </Box>
          ) }
          <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, opacity: isImageLoading ? 0.5 : 1 } }>
            { images.map((img) => {
              const selected = img.url === imageUrl;
              return (
                <Box
                  key={ img.id }
                  role="button"
                  aria-label={ selected ? '사진 선택 해제' : '이 사진 선택' }
                  aria-pressed={ selected }
                  onClick={ () => setImageUrl(selected ? '' : img.url) }
                  sx={ { position: 'relative', cursor: 'pointer', borderRadius: 3, overflow: 'hidden', aspectRatio: '1', outline: selected ? `4px solid ${COLORS.orangeDeep}` : 'none', outlineOffset: -4 } }
                >
                  <Box component="img" src={ sizedImage(img.url, 300) } alt={ img.alt } loading="lazy" sx={ { width: 1, height: 1, objectFit: 'cover', display: 'block' } } />
                  { selected && (
                    <CheckCircleRoundedIcon sx={ { position: 'absolute', right: 6, top: 6, color: '#fff', bgcolor: COLORS.orangeDeep, borderRadius: '50%' } } />
                  ) }
                </Box>
              );
            }) }
          </Box>
        </Box>

        { isEdit && (
          <Button color="error" onClick={ () => setConfirmDelete(true) }>🗑️ 이 후기 삭제하기</Button>
        ) }
      </Box>

      {/* 하단 큰 등록 버튼 */}
      <Box sx={ { position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: MOBILE_WIDTH, px: 2, zIndex: 15 } }>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={ handleSubmit }
          disabled={ isSubmitting }
          sx={ { minHeight: 56, fontSize: 18, boxShadow: '0 8px 20px rgba(240,135,90,.35)', opacity: validationMessage ? 0.85 : 1 } }
        >
          { isSubmitting ? <CircularProgress size={ 24 } color="inherit" /> : (isEdit ? '수정 완료 ✨' : '후기 등록하기 🎉') }
        </Button>
      </Box>
      <Box sx={ { height: 80 } } />

      {/* 책 직접 등록 */}
      <Dialog open={ newBookOpen } onClose={ () => setNewBookOpen(false) } fullWidth maxWidth="xs" slotProps={ { paper: { sx: { borderRadius: '24px', m: 2 } } } }>
        <DialogTitle sx={ { fontFamily: "'Jua', sans-serif" } }>📚 새 책 등록</DialogTitle>
        <DialogContent sx={ { display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' } }>
          <TextField label="책 제목" value={ newBook.title } onChange={ (e) => setNewBook({ ...newBook, title: e.target.value }) } />
          <TextField label="저자" value={ newBook.author } onChange={ (e) => setNewBook({ ...newBook, author: e.target.value }) } />
          <TextField select label="장르" value={ newBook.genre } onChange={ (e) => setNewBook({ ...newBook, genre: e.target.value }) }>
            { GENRES.map((g) => <MenuItem key={ g } value={ g }>{ g }</MenuItem>) }
          </TextField>
        </DialogContent>
        <DialogActions sx={ { px: 3, pb: 2 } }>
          <Button onClick={ () => setNewBookOpen(false) }>취소</Button>
          <Button variant="contained" onClick={ handleCreateBook }>등록</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={ confirmDelete } onClose={ () => setConfirmDelete(false) } slotProps={ { paper: { sx: { borderRadius: '24px' } } } }>
        <DialogTitle sx={ { fontFamily: "'Jua', sans-serif" } }>후기를 삭제할까요?</DialogTitle>
        <DialogContent>삭제한 후기와 댓글은 되돌릴 수 없어요.</DialogContent>
        <DialogActions sx={ { px: 3, pb: 2 } }>
          <Button onClick={ () => setConfirmDelete(false) }>취소</Button>
          <Button variant="contained" color="error" onClick={ handleDelete }>삭제</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PostWritePage;
