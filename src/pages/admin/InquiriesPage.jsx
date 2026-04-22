// Created: 2026-04-08 23:15:09
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const STATUS_LABELS = { PENDING: '접수', IN_PROGRESS: '처리 중', COMPLETED: '완료', CANCELLED: '취소' }
const STATUS_CLASS = { PENDING: 'bg-yellow-100 text-yellow-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-slate-100 text-slate-500' }
const SIZE_COLOR = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [detailModal, setDetailModal] = useState(null)
  const [memoValue, setMemoValue] = useState('')
  const [confirmModal, setConfirmModal] = useState(null)

  async function load() {
    const res = await client.get('/admin/inquiries')
    setInquiries(res.data)
  }

  useEffect(() => { load() }, [])

  async function openDetail(row) {
    const res = await client.get(`/admin/inquiries/${row.id}`)
    setDetailModal(res.data)
    setMemoValue(res.data.adminMemo ?? '')
  }

  async function changeStatus(id, status) {
    await client.patch(`/admin/inquiries/${id}/status`, { status })
    const res = await client.get(`/admin/inquiries/${id}`)
    setDetailModal(res.data)
    load()
  }

  function deleteInquiry(id) {
    setConfirmModal({
      message: `문의 #${id}를 삭제할까요?`,
      confirmLabel: '삭제',
      confirmClass: 'bg-red-500 hover:bg-red-600',
      onConfirm: async () => {
        await client.delete(`/admin/inquiries/${id}`)
        setConfirmModal(null)
        setDetailModal(null)
        load()
      },
    })
  }

  async function saveMemo() {
    await client.patch(`/admin/inquiries/${detailModal.id}/memo`, { adminMemo: memoValue })
    load()
    setDetailModal((p) => ({ ...p, adminMemo: memoValue }))
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true, width: '56px' },
    { key: 'customerName', label: '고객명', sortable: true, width: '88px', render: (v) => <span className="font-bold">{v}</span> },
    { key: 'customerPhone', label: '연락처', width: '116px' },
    { key: 'desiredSize', label: '사이즈', sortable: true, width: '72px', render: (v) => <span className="inline-block w-9 py-1 rounded-full text-[11px] font-bold text-white text-center" style={{ backgroundColor: SIZE_COLOR[v] ?? '#e2e8f0' }}>{v}</span> },
    { key: 'desiredStartDate', label: '희망 시작일', sortable: true, width: '100px' },
    { key: 'desiredDurationMonths', label: '기간(월)', width: '68px' },
    { key: 'message', label: '문의 내용', wrap: true, render: (v) => <span className="block text-left text-slate-500 truncate max-w-[320px]">{v ?? '-'}</span> },
    { key: 'status', label: '상태', sortable: true, width: '88px', render: (v) => <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CLASS[v]}`}>{STATUS_LABELS[v]}</span> },
    { key: 'createdAt', label: '접수일', sortable: true, width: '96px', render: (v) => v?.slice(0, 10) },
  ]

  return (
    <div className="p-12 px-14 max-w-[1400px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">문의 관리</h1>
      </div>

      <DataTable columns={columns} rows={inquiries} actions={(row) => (
        <button className="px-2.5 py-1 rounded-md text-[12px] font-semibold mr-1 bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => openDetail(row)}>상세</button>
      )} />

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          confirmClass={confirmModal.confirmClass}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[4px]" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-[620px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)]" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-orange-500 shrink-0" />
            <div className="p-8 overflow-y-auto">
            <h2 className="text-[18px] font-extrabold mb-6 tracking-tight flex items-center gap-2.5"><span className="w-1 h-5 bg-orange-500 rounded-full shrink-0" />문의 상세 <span className="text-slate-400 font-bold">#{detailModal.id}</span></h2>
            <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2.5 mb-5 text-[13px]">
              <span className="font-semibold text-slate-500">고객명</span><span>{detailModal.customerName}</span>
              <span className="font-semibold text-slate-500">연락처</span><span>{detailModal.customerPhone}</span>
              <span className="font-semibold text-slate-500">이메일</span><span>{detailModal.customerEmail ?? '-'}</span>
              <span className="font-semibold text-slate-500">희망 사이즈</span><span>{detailModal.desiredSize}</span>
              <span className="font-semibold text-slate-500">지정 유닛</span><span>{detailModal.unitNumber ?? '-'}</span>
              <span className="font-semibold text-slate-500">희망 시작일</span><span>{detailModal.desiredStartDate}</span>
              <span className="font-semibold text-slate-500">이용 기간</span><span>{detailModal.desiredDurationMonths}개월</span>
              <span className="font-semibold text-slate-500">문의 내용</span><span>{detailModal.message ?? '-'}</span>
              <span className="font-semibold text-slate-500">상태</span>
              <span>
                <div className="inline-flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`px-2.5 py-1 rounded-md text-[12px] font-semibold border-[1.5px] transition-all ${
                        detailModal.status === s
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-orange-500 hover:text-orange-500'
                      }`}
                      onClick={() => changeStatus(detailModal.id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </span>
            </div>
            <div className="border-t border-slate-100 pt-5 mb-4">
              <label className="text-[13px] font-semibold block mb-2 text-slate-700">관리자 메모</label>
              <textarea 
                rows={3} 
                className="w-full border-[1.5px] border-slate-200 rounded-lg p-3.5 outline-none resize-vertical text-[13px] mb-2 focus:border-orange-500 focus:bg-white focus:ring-[6px] focus:ring-orange-500/15 bg-slate-50"
                value={memoValue} 
                onChange={(e) => setMemoValue(e.target.value)} 
              />
              <button className="btn-sm btn-edit" onClick={saveMemo}>메모 저장</button>
            </div>
            <div className="border-t border-slate-100 pt-5 mt-2 flex justify-between items-center">
              <button className="btn-sm btn-delete" onClick={() => deleteInquiry(detailModal.id)}>삭제</button>
              <button className="btn-ghost" onClick={() => setDetailModal(null)}>닫기</button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
