import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { COLORS } from '../theme.js';
import { AVATAR_PRESETS } from '../utils/constants.js';

/** 프로필 수정 팝업 – 아바타, 닉네임, 한줄 소개, 올해 독서 목표 */
function ProfileEditDialog({ open, profile, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    avatar_url: profile.avatar_url ?? '',
    display_name: profile.display_name,
    bio: profile.bio ?? '',
    reading_goal: profile.reading_goal,
  }));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      avatar_url: form.avatar_url || null,
      display_name: form.display_name.trim() || profile.display_name,
      bio: form.bio.trim() || null,
      reading_goal: Math.min(365, Math.max(1, Number(form.reading_goal) || 12)),
    });
    setIsSaving(false);
  };

  return (
    <Dialog open={ open } onClose={ onClose } fullWidth maxWidth="xs" slotProps={ { paper: { sx: { borderRadius: '24px', m: 2 } } } }>
      <DialogTitle sx={ { fontFamily: "'Jua', sans-serif" } }>프로필 수정 ✏️</DialogTitle>
      <DialogContent sx={ { display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' } }>
        <Box>
          <Typography variant="subtitle2" sx={ { mb: 1 } }>프로필 캐릭터</Typography>
          <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 } }>
            { AVATAR_PRESETS.map((emoji) => {
              const value = `emoji:${emoji}`;
              const selected = form.avatar_url === value;
              return (
                <Box
                  key={ emoji }
                  role="button"
                  aria-label={ `${emoji} 아바타 선택` }
                  aria-pressed={ selected }
                  onClick={ () => setForm({ ...form, avatar_url: value }) }
                  sx={ { aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 24, cursor: 'pointer', bgcolor: selected ? COLORS.yellow : COLORS.yellowSoft, border: `2px solid ${selected ? COLORS.orangeDeep : 'transparent'}` } }
                >
                  { emoji }
                </Box>
              );
            }) }
          </Box>
        </Box>
        <TextField label="닉네임" value={ form.display_name } onChange={ (e) => setForm({ ...form, display_name: e.target.value }) } slotProps={ { htmlInput: { maxLength: 30 } } } />
        <TextField label="한줄 소개" value={ form.bio } onChange={ (e) => setForm({ ...form, bio: e.target.value }) } helperText={ `${form.bio.length} / 100` } slotProps={ { htmlInput: { maxLength: 100 } } } />
        <TextField label="올해 독서 목표 (권)" type="number" value={ form.reading_goal } onChange={ (e) => setForm({ ...form, reading_goal: e.target.value }) } slotProps={ { htmlInput: { min: 1, max: 365 } } } />
      </DialogContent>
      <DialogActions sx={ { px: 3, pb: 2 } }>
        <Button onClick={ onClose }>취소</Button>
        <Button variant="contained" onClick={ handleSave } disabled={ isSaving }>저장</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileEditDialog;
