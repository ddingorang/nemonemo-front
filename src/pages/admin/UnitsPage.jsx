// Created: 2026-04-08 23:14:57
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const STATUS_LABELS = { AVAILABLE: '이용 가능', OCCUPIED: '사용 중', RESERVED: '예약됨', MAINTENANCE: '점검 중' }
const STATUS_CLASS = { AVAILABLE: 'bg-green-100 text-green-700', OCCUPIED: 'bg-orange-100 text-orange-700', RESERVED: 'bg-yellow-100 text-yellow-700', MAINTENANCE: 'bg-slate-100 text-slate-500' }
const SIZES = ['S', 'M', 'L', 'XL']
const STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']

const EMPTY_FORM = { warehouseId: 1, unitNumber: '', size: 'S', areaSqm: '', floor: '', zone: '', monthlyPrice: '' }

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [statusModal, setStatusModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

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

  function deactivate(row) {
    setConfirmModal({
      message: `유닛 ${row.unitNumber}의 계약을 초기화할까요?`,
      onConfirm: async () => {
        await client.delete(`/admin/units/${row.id}`)
        setConfirmModal(null)
        load()
      },
    })
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
      ? <span className={row.expiringSoon ? 'text-orange-600 font-bold' : ''}>{v}</span>
      : '-' },
    { key: 'status', label: '상태', sortable: true, render: (v) => <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CLASS[v]}`}>{STATUS_LABELS[v]}</span> },
  ]

  return (
    <div className="p-9 px-10 max-w-[1400px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">유닛 관리</h1>
        <button className="btn-primary" onClick={openCreate}>+ 유닛 추가</button>
      </div>

      <DataTable
        columns={columns}
        rows={units}
        onEdit={openEdit}
        onDelete={deactivate}
        actions={(row) => (
          <button className="px-2.5 py-1 rounded-md text-[12px] font-semibold mr-1 bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setStatusModal(row)}>상태 변경</button>
        )}
      />

      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[3px]" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[20px] p-9 w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-extrabold mb-6 tracking-tight">{modal === 'create' ? '유닛 추가' : '유닛 수정'}</h2>
            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 items-center mb-5">
              <label className="text-[13px] font-semibold text-slate-700">유닛 번호</label>
              <input 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.unitNumber} 
                onChange={(e) => set('unitNumber', e.target.value)} 
              />
              {modal === 'create' && <>
                <label className="text-[13px] font-semibold text-slate-700">사이즈</label>
                <select 
                  className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                  value={form.size} 
                  onChange={(e) => set('size', e.target.value)}
                >
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </>}
              <label className="text-[13px] font-semibold text-slate-700">면적(㎡)</label>
              <input 
                type="number" 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.areaSqm} 
                onChange={(e) => set('areaSqm', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">층</label>
              <input 
                type="number" 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.floor} 
                onChange={(e) => set('floor', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">구역</label>
              <input 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.zone} 
                onChange={(e) => set('zone', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">월 임대료</label>
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

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-[3px]" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-[20px] p-9 w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-extrabold mb-6 tracking-tight">{statusModal.unitNumber} 상태 변경</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`px-4 py-2 rounded-lg border-[1.5px] transition-all text-[13px] font-semibold ${
                    statusModal.status === s 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-600 hover:text-blue-600'
                  }`}
                  onClick={() => changeStatus(statusModal.id, s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn-ghost" onClick={() => setStatusModal(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
