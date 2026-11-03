import { useContext } from 'react';

import { ToastContext } from '../utils/toast-context.js';

/** 하단 토스트 메시지를 띄우는 함수 반환: toast('메시지', 'success' | 'error' | 'info') */
export function useToast() {
  return useContext(ToastContext);
}
