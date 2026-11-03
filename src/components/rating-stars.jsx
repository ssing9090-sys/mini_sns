import Rating from '@mui/material/Rating';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

/** 별점 (읽기 전용 또는 입력용) */
function RatingStars({ value, onChange, size = 'small', readOnly = !onChange }) {
  return (
    <Rating
      value={ value }
      onChange={ (_, v) => onChange?.(v) }
      readOnly={ readOnly }
      size={ size }
      icon={ <StarRoundedIcon fontSize="inherit" /> }
      emptyIcon={ <StarRoundedIcon fontSize="inherit" sx={ { color: '#F1E2D6' } } /> }
      sx={ { color: '#FFC75F' } }
    />
  );
}

export default RatingStars;
