export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card small" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
