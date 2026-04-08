// Created: 2026-04-08 23:14:57
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'

const STATUS_LABELS = { AVAILABLE: '이용 가능', OCCUPIED: '사용 중', RESERVED: '예약됨', MAINTENANCE: '점검 중' }
const STATUS_CLASS = { AVAILABLE: 'badge-green', OCCUPIED: 'badge-orange', RESERVED: 'badge-yellow', MAINTENANCE: 'badge-gray' }
const SIZES = ['S', 'M', 'L', 'XL']
const STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']

const EMPTY_FORM = { warehouseId: 1, unitNumber: '', size: 'S', areaSqm: '', floor: '', zone: '', monthlyPrice: '' }

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [statusModal, setStatusModal] = useState(null)

  async function load() {
    const res = await client.get('/admin/units')
    setUnits(res.data)
  }

  useEffect(() => { load() }, [])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function openCreate() { setForm(EMPTY_FORM); setModal('create') }
  function openEdit(row) { setForm({ ...row, warehouseId: row.warehouseId ?? 1 }); setModal('edit') }

  async function saveCreate() {
    await client.post('/admin/units', { ...form, areaSqm: Number(form.areaSqm), floor: Number(form.floor) || null, monthlyPrice: Number(form.monthlyPrice) })
    setModal(null); load()
  }

  async function saveEdit() {
    await client.put(`/admin/units/${form.id}`, { unitNumber: form.unitNumber, areaSqm: Number(form.areaSqm), floor: Number(form.floor) || null, zone: form.zone, monthlyPrice: Number(form.monthlyPrice) })
    setModal(null); load()
  }

  async function deactivate(row) {
    if (!confirm(`유닛 ${row.unitNumber}을 비활성화할까요?`)) return
    await client.delete(`/admin/units/${row.id}`)
    load()
  }

  async function changeStatus(unitId, status) {
    await client.patch(`/admin/units/${unitId}/status`, { status })
    setStatusModal(null); load()
  }

  const columns = [
    { key: 'unitNumber', label: '유닛 번호', sortable: true },
    { key: 'contractCustomerName', label: '사용 고객', sortable: true, render: (v) => v ?? '-' },
    { key: 'contractCustomerPhone', label: '연락처', render: (v) => v ?? '-' },
    { key: 'contractCreatedAt', label: '계약 일자', sortable: true, render: (v) => v ? v.slice(0, 10) : '-' },
    { key: 'contractStartDate', label: '시작일', sortable: true, render: (v) => v ?? '-' },
    { key: 'contractEndDate', label: '만료 예정일', sortable: true, render: (v, row) => v
      ? <span style={{ color: row.expiringSoon ? '#d97706' : 'inherit', fontWeight: row.expiringSoon ? 700 : 400 }}>{v}</span>
      : '-' },
    { key: 'status', label: '상태', sortable: true, render: (v) => <span className={`badge ${STATUS_CLASS[v]}`}>{STATUS_LABELS[v]}</span> },
  ]

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">유닛 관리</h1>
        <button className="btn-primary" onClick={openCreate}>+ 유닛 추가</button>
      </div>

      <DataTable
        columns={columns}
        rows={units}
        onEdit={openEdit}
        onDelete={deactivate}
        actions={(row) => (
          <button className="btn-sm btn-neutral" onClick={() => setStatusModal(row)}>상태 변경</button>
        )}
      />

      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'create' ? '유닛 추가' : '유닛 수정'}</h2>
            <div className="form-grid">
              <label>유닛 번호</label>
              <input value={form.unitNumber} onChange={(e) => set('unitNumber', e.target.value)} />
              {modal === 'create' && <>
                <label>사이즈</label>
                <select value={form.size} onChange={(e) => set('size', e.target.value)}>
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </>}
              <label>면적(㎡)</label>
              <input type="number" value={form.areaSqm} onChange={(e) => set('areaSqm', e.target.value)} />
              <label>층</label>
              <input type="number" value={form.floor} onChange={(e) => set('floor', e.target.value)} />
              <label>구역</label>
              <input value={form.zone} onChange={(e) => set('zone', e.target.value)} />
              <label>월 임대료</label>
              <input type="number" value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn-primary" onClick={modal === 'create' ? saveCreate : saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{statusModal.unitNumber} 상태 변경</h2>
            <div className="status-btn-group">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`btn-status ${statusModal.status === s ? 'active' : ''}`}
                  onClick={() => changeStatus(statusModal.id, s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setStatusModal(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
