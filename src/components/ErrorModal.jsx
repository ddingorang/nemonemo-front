export default function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[4px]" onClick={onClose}>
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-red-500" />
        <div className="px-8 pt-8 pb-7 text-center">
          <div className="w-[60px] h-[60px] rounded-full bg-red-50 ring-8 ring-red-100/70 text-red-500 text-[22px] font-black flex items-center justify-center mx-auto mb-5">
            !
          </div>
          <h2 className="text-[16px] font-extrabold mb-2 tracking-tight text-slate-800">오류 발생</h2>
          <p className="text-slate-500 text-[13px] leading-relaxed mb-7">{message}</p>
          <button className="btn-primary px-8" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  )
}
