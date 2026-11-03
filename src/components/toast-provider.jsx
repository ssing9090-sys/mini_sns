import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { ToastContext } from '../utils/toast-context.js';

/** 화면 하단(네비게이션 위)에 짧은 안내 메시지를 띄운다 */
function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const show = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = () => setToast((prev) => ({ ...prev, open: false }));

  return (
    <ToastContext.Provider value={ show }>
      { children }
      <Snackbar
        open={ toast.open }
        autoHideDuration={ 2500 }
        onClose={ handleClose }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
        sx={ { bottom: { xs: 96 } } }
      >
        <Alert
          onClose={ handleClose }
          severity={ toast.severity }
          variant="filled"
          sx={ { borderRadius: 999, fontWeight: 600 } }
        >
          { toast.message }
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
