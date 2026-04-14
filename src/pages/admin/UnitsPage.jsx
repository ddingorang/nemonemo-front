// Created: 2026-04-08 23:14:57
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const STATUS_LABELS = { AVAILABLE: '이용 가능', OCCUPIED: '사용 중', RESERVED: '예약됨', MAINTENANCE: '점검 중' }
const STATUS_CLASS = { AVAILABLE: 'bg-green-100 text-green-700', OCCUPIED: 'bg-orange-100 text-orange-700', RESERVED: 'bg-yellow-100 text-yellow-700', MAINTENANCE: 'bg-slate-100 text-slate-500' }
const SIZES = ['S', 'M', 'L', 'XL']
const FILTER_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']

const SIZE_COLOR = {
  XS: '#818cf8',
  S:  '#4ade80',
  M:  '#38bdf8',
  L:  '#fb923c',
  XL: '#f43f5e',
}

const EMPTY_FORM = { warehouseId: 1, unitNumber: '', size: 'S', zone: '', monthlyPrice: '' }

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [sizeFilter, setSizeFilter] = useState(null)
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
    await client.post('/admin/units', { ...form, monthlyPrice: Number(form.monthlyPrice) })
    setModal(null); load()
  }

  async function saveEdit() {
    await client.put(`/admin/units/${form.id}`, { unitNumber: form.unitNumber, zone: form.zone, monthlyPrice: Number(form.monthlyPrice) })
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
    { key: 'unitNumber', label: '유닛 번호', sortable: true, render: (v, row) => (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-extrabold text-slate-900"
        style={{ backgroundColor: SIZE_COLOR[row.size] ?? '#e2e8f0' }}
      >
        {v}
      </span>
    )},
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
    <div className="p-12 px-14 max-w-[1400px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">유닛 관리</h1>
        <button className="btn-primary" onClick={openCreate}>+ 유닛 추가</button>
      </div>

      <DataTable
        columns={columns}
        rows={sizeFilter ? units.filter((u) => u.size === sizeFilter) : units}
        onEdit={openEdit}
        actions={(row) => (
          <button className="px-2.5 py-1 rounded-md text-[12px] font-semibold mr-1 bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setStatusModal(row)}>상태 변경</button>
        )}
        headerExtra={
          <div className="flex items-center gap-1">
            <button
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border-[1.5px] ${sizeFilter === null ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}
              onClick={() => setSizeFilter(null)}
            >전체</button>
            {FILTER_SIZES.map((s) => (
              <button
                key={s}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border-[1.5px] ${sizeFilter === s ? 'text-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'}`}
                style={sizeFilter === s
                  ? { backgroundColor: SIZE_COLOR[s], borderColor: SIZE_COLOR[s], color: '#1e293b' }
                  : { borderColor: '#e2e8f0' }
                }
                onMouseEnter={(e) => { if (sizeFilter !== s) { e.currentTarget.style.borderColor = SIZE_COLOR[s]; e.currentTarget.style.color = SIZE_COLOR[s] } }}
                onMouseLeave={(e) => { if (sizeFilter !== s) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '' } }}
                onClick={() => setSizeFilter(s)}
              >{s}</button>
            ))}
          </div>
        }
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
              <label className="text-[13px] font-semibold text-slate-700">구역</label>
              <input 
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.zone} 
                onChange={(e) => set('zone', e.target.value)} 
              />
              <label className="text-[13px] font-semibold text-slate-700">월 임대료</label>
              <input
                type="text"
                inputMode="numeric"
                className="border-[1.5px] border-slate-200 rounded-lg p-2 px-3 outline-none transition-all w-full focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-[13px]"
                value={form.monthlyPrice ? Number(form.monthlyPrice).toLocaleString() : ''}
                onChange={(e) => set('monthlyPrice', e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              {modal === 'edit' && (
                <button className="btn-delete btn-sm mr-auto" onClick={() => { setModal(null); deactivate(form) }}>삭제</button>
              )}
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
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-orange-500 hover:text-orange-500'
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
