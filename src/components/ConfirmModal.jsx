export default function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = '삭제', confirmClass = 'bg-red-600 hover:bg-red-700' }) {
  const isDanger = confirmClass.includes('red')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 backdrop-blur-[4px]" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 ${isDanger ? 'bg-red-500' : 'bg-amber-400'}`} />
        <div className="px-8 pt-8 pb-7 text-center">
          <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-5 text-[22px] font-black
            ${isDanger
              ? 'bg-red-50 text-red-500 ring-8 ring-red-100/70'
              : 'bg-amber-50 text-amber-500 ring-8 ring-amber-100/70'
            }`}
          >
            {isDanger ? '!' : '?'}
          </div>
          <p className="text-slate-700 text-[14px] font-medium leading-relaxed mb-7">{message}</p>
          <div className="flex justify-center gap-2.5">
            <button className="btn-ghost" onClick={onCancel}>취소</button>
            <button
              className={`${confirmClass} text-white px-6 py-2 rounded-lg font-semibold text-[14px] transition-all duration-200`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
