// Created: 2026-04-13 21:11:29
export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[3px]" onClick={onCancel}>
      <div className="bg-white rounded-[20px] p-9 w-full max-w-[380px] max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.25)] text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-[52px] h-[52px] rounded-full bg-yellow-100 text-[#a16207] text-2xl font-extrabold flex items-center justify-center mx-auto mb-4">?</div>
        <h2 className="text-[18px] font-extrabold mb-2.5 tracking-tight">확인</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex justify-center gap-2 mt-2">
          <button className="btn-ghost" onClick={onCancel}>취소</button>
          <button className="bg-red-600 text-white px-[22px] py-[8px] rounded-lg font-semibold transition-all duration-200 hover:bg-red-700" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  )
}
