// Created: 2026-04-13 21:09:52
export default function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[3px]" onClick={onClose}>
      <div className="bg-white rounded-[20px] p-9 w-full max-w-[380px] max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.25)] text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-[52px] h-[52px] rounded-full bg-red-100 text-red-600 text-2xl font-extrabold flex items-center justify-center mx-auto mb-4">!</div>
        <h2 className="text-[18px] font-extrabold mb-2.5 tracking-tight">오류 발생</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex justify-center mt-2">
          <button className="btn-primary px-8" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  )
}
