import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Mascot from './mascot.jsx';

/** 내용이 없을 때 보여주는 안내 */
function EmptyState({ title, description, action, mood = 'think' }) {
  return (
    <Box sx={ { py: 5, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 } }>
      <Mascot size={ 80 } mood={ mood } />
      <Typography variant="h6" sx={ { mt: 1 } }>{ title }</Typography>
      { description && <Typography variant="body2" color="text.secondary">{ description }</Typography> }
      { action && <Box sx={ { mt: 1.5 } }>{ action }</Box> }
    </Box>
  );
}

export default EmptyState;
