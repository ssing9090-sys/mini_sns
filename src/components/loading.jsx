import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/** 로딩 표시 */
function Loading({ text = '책장을 넘기는 중이에요' }) {
  return (
    <Box sx={ { py: 8, display: 'grid', placeItems: 'center', gap: 1.5 } }>
      <CircularProgress size={ 32 } />
      <Typography variant="body2" color="text.secondary">{ text }…</Typography>
    </Box>
  );
}

export default Loading;
