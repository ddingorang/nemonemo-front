// Created: 2026-04-13 21:11:29
export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">?</div>
        <h2>확인</h2>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>취소</button>
          <button className="btn-delete-confirm" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  )
}
