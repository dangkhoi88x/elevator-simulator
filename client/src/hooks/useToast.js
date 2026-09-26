import { useCallback, useEffect, useRef, useState } from 'react';

// Thông báo ngắn tự ẩn; báo mới thay thế báo cũ
export function useToast(durationMs = 3000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((message) => {
    clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message });
    timerRef.current = setTimeout(() => setToast(null), durationMs);
  }, [durationMs]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, show };
}
