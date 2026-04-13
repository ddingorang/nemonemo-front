// Created: 2026-04-13 21:09:52
export default function ErrorModal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-error" onClick={(e) => e.stopPropagation()}>
        <div className="error-icon">!</div>
        <h2>오류 발생</h2>
        <p className="error-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  )
}
