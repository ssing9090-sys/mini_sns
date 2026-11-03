import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { COLORS } from '../theme.js';

/** 섹션 제목 + (선택) 더보기 링크 */
function SectionTitle({ emoji, title, subtitle, moreTo }) {
  return (
    <Box sx={ { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 1.5 } }>
      <Box>
        <Typography variant="h6" sx={ { fontSize: 19 } }>
          { emoji && <span style={ { marginRight: 6 } }>{ emoji }</span> }
          { title }
        </Typography>
        { subtitle && <Typography variant="body2" color="text.secondary">{ subtitle }</Typography> }
      </Box>
      { moreTo && (
        <Typography component={ RouterLink } to={ moreTo } sx={ { fontSize: 14, color: COLORS.orangeDeep, textDecoration: 'none', fontWeight: 700, flexShrink: 0 } }>
          더보기 ›
        </Typography>
      ) }
    </Box>
  );
}

export default SectionTitle;
