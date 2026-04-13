// Created: 2026-04-08 23:15:25
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const STATUS_LABELS = { ACTIVE: '활성', EXPIRED: '만료', TERMINATED: '해지' }
const STATUS_CLASS = { ACTIVE: 'badge-green', EXPIRED: 'badge-gray', TERMINATED: 'badge-orange' }

const EMPTY_FORM = {
  unitId: '', inquiryId: '', customerName: '', customerPhone: '',
  customerEmail: '', startDate: '', endDate: '', monthlyPrice: '',
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [units, setUnits] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmModal, setConfirmModal] = useState(null)

  async function load() {
    const res = await client.get('/admin/contracts')
    setContracts(res.data)
  }

  useEffect(() => {
    load()
    client.get('/admin/units').then((res) => setUnits(res.data))
  }, [])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function openCreate() { setForm(EMPTY_FORM); setModal('create') }
  function openEdit(row) {
    setForm({
      id: row.id, unitId: row.unitId, inquiryId: row.inquiryId ?? '',
      customerName: row.customerName, customerPhone: row.customerPhone,
      customerEmail: row.customerEmail ?? '', startDate: row.startDate,
      endDate: row.endDate, monthlyPrice: row.monthlyPrice,
    })
    setModal('edit')
  }

  async function saveCreate() {
    await client.post('/admin/contracts', {
      ...form,
      unitId: Number(form.unitId),
      inquiryId: form.inquiryId ? Number(form.inquiryId) : null,
      monthlyPrice: Number(form.monthlyPrice),
    })
    setModal(null); load()
  }

  async function saveEdit() {
    await client.put(`/admin/contracts/${form.id}`, {
      unitId: Number(form.unitId),
      customerName: form.customerName, customerPhone: form.customerPhone,
      customerEmail: form.customerEmail, startDate: form.startDate,
      endDate: form.endDate, monthlyPrice: Number(form.monthlyPrice),
    })
    setModal(null); load()
  }

  function terminate(row) {
    setConfirmModal({
      message: `계약 #${row.id}을 해지할까요?`,
      onConfirm: async () => {
        await client.patch(`/admin/contracts/${row.id}/terminate`)
        setConfirmModal(null)
        load()
      },
    })
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'unitNumber', label: '유닛', sortable: true },
    { key: 'customerName', label: '고객명', sortable: true },
    { key: 'customerPhone', label: '연락처' },
    { key: 'startDate', label: '시작일', sortable: true },
    { key: 'endDate', label: '종료일', sortable: true },
    { key: 'monthlyPrice', label: '월 임대료', render: (v) => `${Number(v).toLocaleString()}원` },
    {
      key: 'status', label: '상태', sortable: true,
      render: (v, row) => (
        <span>
          <span className={`badge ${STATUS_CLASS[v]}`}>{STATUS_LABELS[v]}</span>
          {row.expiringSoon && <span className="badge badge-yellow" style={{ marginLeft: 4 }}>만료임박</span>}
        </span>
      ),
    },
    { key: 'createdAt', label: '등록일', sortable: true, render: (v) => v?.slice(0, 10) },
  ]

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">계약 관리</h1>
        <button className="btn-primary" onClick={openCreate}>+ 계약 등록</button>
      </div>

      <DataTable
        columns={columns}
        rows={contracts}
        onEdit={(row) => row.status === 'ACTIVE' ? openEdit(row) : null}
        actions={(row) => row.status === 'ACTIVE' && (
          <button className="btn-sm btn-delete" onClick={() => terminate(row)}>해지</button>
        )}
      />

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'create' ? '계약 등록' : '계약 수정'}</h2>
            <div className="form-grid">
              <label>유닛 *</label>
              <select value={form.unitId} onChange={(e) => set('unitId', e.target.value)}>
                <option value="">선택</option>
                {units
                  .filter((u) => u.status === 'AVAILABLE' || (modal === 'edit' && u.id === Number(form.unitId)))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.unitNumber} ({u.size})</option>
                  ))}
              </select>
              {modal === 'create' && <>
                <label>연결 문의 ID</label>
                <input value={form.inquiryId} onChange={(e) => set('inquiryId', e.target.value)} placeholder="선택 사항" />
              </>}
              <label>고객명 *</label>
              <input value={form.customerName} onChange={(e) => set('customerName', e.target.value)} />
              <label>연락처 *</label>
              <input value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} />
              <label>이메일</label>
              <input type="email" value={form.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} />
              <label>시작일 *</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              <label>종료일 *</label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              <label>월 임대료 *</label>
              <input type="number" value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn-primary" onClick={modal === 'create' ? saveCreate : saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
