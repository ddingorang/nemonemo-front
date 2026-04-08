// Created: 2026-04-08 23:15:09
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'

const STATUS_LABELS = { PENDING: '접수', IN_PROGRESS: '처리 중', COMPLETED: '완료', CANCELLED: '취소' }
const STATUS_CLASS = { PENDING: 'badge-yellow', IN_PROGRESS: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-gray' }
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [detailModal, setDetailModal] = useState(null)
  const [memoValue, setMemoValue] = useState('')

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

  async function saveMemo() {
    await client.patch(`/admin/inquiries/${detailModal.id}/memo`, { adminMemo: memoValue })
    load()
    setDetailModal((p) => ({ ...p, adminMemo: memoValue }))
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'customerName', label: '고객명', sortable: true },
    { key: 'customerPhone', label: '연락처' },
    { key: 'desiredSize', label: '희망 사이즈', sortable: true },
    { key: 'unitNumber', label: '지정 유닛', render: (v) => v ?? '-' },
    { key: 'desiredStartDate', label: '희망 시작일', sortable: true },
    { key: 'desiredDurationMonths', label: '기간(월)' },
    { key: 'status', label: '상태', sortable: true, render: (v) => <span className={`badge ${STATUS_CLASS[v]}`}>{STATUS_LABELS[v]}</span> },
    { key: 'createdAt', label: '접수일', sortable: true, render: (v) => v?.slice(0, 10) },
  ]

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">문의 관리</h1>
      </div>

      <DataTable columns={columns} rows={inquiries} actions={(row) => (
        <button className="btn-sm btn-neutral" onClick={() => openDetail(row)}>상세</button>
      )} />

      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>문의 상세 #{detailModal.id}</h2>
            <div className="detail-grid">
              <span>고객명</span><span>{detailModal.customerName}</span>
              <span>연락처</span><span>{detailModal.customerPhone}</span>
              <span>이메일</span><span>{detailModal.customerEmail ?? '-'}</span>
              <span>희망 사이즈</span><span>{detailModal.desiredSize}</span>
              <span>지정 유닛</span><span>{detailModal.unitNumber ?? '-'}</span>
              <span>희망 시작일</span><span>{detailModal.desiredStartDate}</span>
              <span>이용 기간</span><span>{detailModal.desiredDurationMonths}개월</span>
              <span>문의 내용</span><span>{detailModal.message ?? '-'}</span>
              <span>상태</span>
              <span>
                <div className="status-btn-group inline">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`btn-status small ${detailModal.status === s ? 'active' : ''}`}
                      onClick={() => changeStatus(detailModal.id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </span>
            </div>
            <div className="memo-section">
              <label>관리자 메모</label>
              <textarea rows={3} value={memoValue} onChange={(e) => setMemoValue(e.target.value)} />
              <button className="btn-sm btn-edit" onClick={saveMemo}>메모 저장</button>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDetailModal(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
