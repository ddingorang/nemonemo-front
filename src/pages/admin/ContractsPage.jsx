// Created: 2026-04-08 23:15:25
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const STATUS_LABELS = { ACTIVE: '활성', EXPIRED: '만료', TERMINATED: '해지' }
const STATUS_CLASS = { ACTIVE: 'bg-green-100 text-green-700', EXPIRED: 'bg-slate-100 text-slate-500', TERMINATED: 'bg-orange-100 text-orange-700' }

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
        <div className="flex items-center gap-1.5">
          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CLASS[v]}`}>{STATUS_LABELS[v]}</span>
          {row.expiringSoon && <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-700">만료임박</span>}
        </div>
      ),
    },
    { key: 'createdAt', label: '등록일', sortable: true, render: (v) => v?.slice(0, 10) },
  ]

  return (
    <div className="p-9 px-10 max-w-[1400px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">계약 관리</h1>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[3px]" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[20px] p-9 w-full max-w-[620px] max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-extrabold mb-6 tracking-tight">{modal === 'create' ? '계약 등록' : '계약 수정'}</h2>
            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 items-center mb-5">
              <label className="text-[13px] font-semibold text-slate-700">유닛 *</label>
              <select 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.unitId} 
                onChange={(e) => set('unitId', e.target.value)}
              >
                <option value="">선택</option>
                {units
                  .filter((u) => u.status === 'AVAILABLE' || (modal === 'edit' && u.id === Number(form.unitId)))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.unitNumber} ({u.size})</option>
                  ))}
              </select>
              {modal === 'create' && <>
                <label className="text-[13px] font-semibold text-slate-700">연결 문의 ID</label>
                <input 
                  className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                  value={form.inquiryId} 
                  onChange={(e) => set('inquiryId', e.target.value)} 
                  placeholder="선택 사항" 
                />
              </>}
              <label className="text-[13px] font-semibold text-slate-700">고객명 *</label>
              <input 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.customerName} 
                onChange={(e) => set('customerName', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">연락처 *</label>
              <input 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.customerPhone} 
                onChange={(e) => set('customerPhone', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">이메일</label>
              <input 
                type="email" 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.customerEmail} 
                onChange={(e) => set('customerEmail', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">시작일 *</label>
              <input 
                type="date" 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.startDate} 
                onChange={(e) => set('startDate', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">종료일 *</label>
              <input 
                type="date" 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.endDate} 
                onChange={(e) => set('endDate', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">월 임대료 *</label>
              <input 
                type="number" 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.monthlyPrice} 
                onChange={(e) => set('monthlyPrice', e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn-primary" onClick={modal === 'create' ? saveCreate : saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
