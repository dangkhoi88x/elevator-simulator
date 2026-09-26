// Luôn render vùng aria-live để trình đọc màn hình bắt được nội dung mới
export function Toast({ toast }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && <div key={toast.id} className="toast">{toast.message}</div>}
    </div>
  );
}
