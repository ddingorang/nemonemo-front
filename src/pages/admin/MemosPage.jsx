// Created: 2026-04-22 22:20:27
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const EMPTY_FORM = { content: '', pinned: false }

function PinIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  )
}

function MemoCard({ memo, onSave, onDelete, onTogglePin }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() {
    setDraft(memo.content ?? '')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function save() {
    await onSave(memo, draft)
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[3px] transition-all duration-200 ${editing ? '' : 'hover:-translate-y-1'} ${memo.pinned ? 'bg-amber-50' : 'bg-[#fafaf7]'}`}
      style={{
        minHeight: '320px',
        boxShadow: editing
          ? '0 0 0 2px #f97316, 3px 5px 14px rgba(0,0,0,0.15)'
          : memo.pinned
          ? '3px 5px 14px rgba(251,146,60,0.22), 1px 1px 0 rgba(0,0,0,0.06)'
          : '3px 5px 14px rgba(0,0,0,0.11), 1px 1px 0 rgba(0,0,0,0.05)',
      }}
    >
      {/* 상단 컬러 스트립 */}
      <div className={`h-7 shrink-0 flex items-center justify-between px-3 ${editing ? 'bg-orange-500' : memo.pinned ? 'bg-orange-400' : 'bg-slate-400'}`}>
        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
          {editing ? '수정 중' : memo.pinned ? '고정' : 'Memo'}
        </span>
        {!editing && memo.pinned && (
          <span className="text-white/90"><PinIcon filled /></span>
        )}
      </div>

      {/* 줄지 영역 */}
      <div
        className="flex-1 px-4 pt-2 pb-2"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, #e2e8f0 23px, #e2e8f0 24px)',
        }}
      >
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent outline-none resize-none text-[13px] text-slate-700"
            style={{ lineHeight: '24px', minHeight: '240px' }}
            placeholder="메모 내용을 입력하세요"
          />
        ) : (
          <p
            className={`text-[13px] whitespace-pre-wrap overflow-hidden ${memo.pinned ? 'text-slate-700' : 'text-slate-600'}`}
            style={{ lineHeight: '24px', maxHeight: '240px' }}
          >
            {memo.content || <span className="text-slate-300 italic">내용 없음</span>}
          </p>
        )}
      </div>

      {/* 하단 푸터 */}
      <div className={`shrink-0 border-t px-3 py-2 flex items-center justify-between ${memo.pinned ? 'border-orange-200 bg-amber-100/40' : 'border-slate-200 bg-slate-100/50'}`}>
        <span className="text-[11.5px] text-slate-500 tabular-nums">
          {memo.updatedAt ? memo.updatedAt.slice(0, 16).replace('T', ' ') : ''}
        </span>
        {editing ? (
          <div className="flex gap-1">
            <button
              className="px-2 py-1 rounded text-[11px] font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
              onClick={cancelEdit}
            >
              취소
            </button>
            <button
              className="px-2 py-1 rounded text-[11px] font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              onClick={save}
            >
              저장
            </button>
          </div>
        ) : (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1.5 rounded text-slate-400 hover:bg-orange-100 hover:text-orange-500 transition-colors"
              onClick={() => onTogglePin(memo)}
            >
              <PinIcon filled={memo.pinned} />
            </button>
            <button
              className="px-2 py-1 rounded text-[11px] font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
              onClick={startEdit}
            >
              수정
            </button>
            <button
              className="px-2 py-1 rounded text-[11px] font-semibold text-red-400 hover:bg-red-100 transition-colors"
              onClick={() => onDelete(memo)}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MemosPage() {
  const [memos, setMemos] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmModal, setConfirmModal] = useState(null)

  async function load() {
    const res = await client.get('/admin/memos')
    const list = res.data.content ?? res.data
    setMemos(list)
  }

  useEffect(() => { load() }, [])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function openCreate() {
    setForm(EMPTY_FORM)
    setModal('form')
  }

  async function create() {
    await client.post('/admin/memos', { content: form.content, pinned: form.pinned })
    setModal(null)
    load()
  }

  async function saveMemo(memo, newContent) {
    await client.put(`/admin/memos/${memo.id}`, { content: newContent, pinned: memo.pinned })
    load()
  }

  function requestDelete(memo) {
    setConfirmModal({
      message: '이 메모를 삭제할까요?',
      confirmLabel: '삭제',
      confirmClass: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        await client.delete(`/admin/memos/${memo.id}`)
        setConfirmModal(null)
        load()
      },
    })
  }

  async function togglePin(memo) {
    await client.put(`/admin/memos/${memo.id}`, {
      content: memo.content,
      pinned: !memo.pinned,
    })
    load()
  }

  const pinned = memos.filter((m) => m.pinned)
  const unpinned = memos.filter((m) => !m.pinned)

  return (
    <div className="p-12 px-14 max-w-[1400px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">메모</h1>
        <button className="btn-primary" onClick={openCreate}>+ 새 메모</button>
      </div>

      {memos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <p className="text-[15px] font-semibold">메모가 없습니다</p>
          <p className="text-[13px] mt-1">새 메모를 작성해보세요</p>
        </div>
      )}

      {pinned.length > 0 && (
        <section className="mb-8">
          <p className="text-[12px] font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <PinIcon filled /> 고정됨
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pinned.map((m) => (
              <MemoCard key={m.id} memo={m} onSave={saveMemo} onDelete={requestDelete} onTogglePin={togglePin} />
            ))}
          </div>
        </section>
      )}

      {unpinned.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">전체</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {unpinned.map((m) => (
              <MemoCard key={m.id} memo={m} onSave={saveMemo} onDelete={requestDelete} onTogglePin={togglePin} />
            ))}
          </div>
        </section>
      )}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          confirmClass={confirmModal.confirmClass}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[4px]" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-[480px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)]" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-orange-500 shrink-0" />
            <div className="p-8 overflow-y-auto">
              <h2 className="text-[18px] font-extrabold mb-6 tracking-tight flex items-center gap-2.5">
                <span className="w-1 h-5 bg-orange-500 rounded-full shrink-0" />
                새 메모
              </h2>
              <div className="flex flex-col gap-4">
                <textarea
                  rows={8}
                  autoFocus
                  className="border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all w-full focus:border-orange-500 focus:bg-white focus:ring-[6px] focus:ring-orange-500/15 bg-slate-50 text-[13px] resize-none"
                  placeholder="메모 내용을 입력하세요"
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                />
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.pinned ? 'bg-orange-500' : 'bg-slate-200'}`}
                    onClick={() => set('pinned', !form.pinned)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.pinned ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700">상단 고정</span>
                </label>
              </div>
              <div className="border-t border-slate-100 pt-5 mt-5 flex justify-end gap-2">
                <button className="btn-ghost" onClick={() => setModal(null)}>취소</button>
                <button className="btn-primary" onClick={create}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
