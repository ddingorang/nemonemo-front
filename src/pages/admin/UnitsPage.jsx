// Created: 2026-04-08 23:14:57
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import WarehouseGrid from '../../components/WarehouseGrid.jsx'

const STATUS_LABELS = { ACTIVE: '사용 중', EXPIRED: '만료', TERMINATED: '해지', AVAILABLE: '비어있음', OCCUPIED: '사용 중', RESERVED: '예약됨', DISABLED: '비활성화' }
const STATUS_CLASS = { ACTIVE: 'bg-green-100 text-green-700', EXPIRED: 'bg-slate-100 text-slate-500', TERMINATED: 'bg-red-100 text-red-500', AVAILABLE: 'bg-blue-100 text-blue-600', OCCUPIED: 'bg-green-100 text-green-700', RESERVED: 'bg-yellow-100 text-yellow-700', DISABLED: 'bg-slate-100 text-slate-500' }
const SIZES = ['S', 'M', 'L', 'XL']
const STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DISABLED']
const STATUS_CONFIG = {
  AVAILABLE: { symbol: '○', label: '비어있음', desc: '사용 가능', ring: 'border-emerald-400 bg-emerald-50 text-emerald-700', idle: 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50' },
  OCCUPIED:  { symbol: '●', label: '사용 중',  desc: '계약 진행 중', ring: 'border-blue-400 bg-blue-50 text-blue-700', idle: 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50' },
  RESERVED:  { symbol: '◑', label: '예약됨',  desc: '예약 접수됨', ring: 'border-amber-400 bg-amber-50 text-amber-700', idle: 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/50' },
  DISABLED:  { symbol: '✕', label: '비활성화', desc: '임시 사용 불가', ring: 'border-slate-400 bg-slate-100 text-slate-600', idle: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50' },
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL']
const SIZE_COLOR = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }
function sizeFromUnitNumber(unitNumber) { return unitNumber?.split('-')[0] ?? '' }
function unitSort(a, b) {
  if (a.endDate && b.endDate) return a.endDate.localeCompare(b.endDate)
  if (a.endDate) return -1
  if (b.endDate) return 1
  const sizeDiff = SIZE_ORDER.indexOf(sizeFromUnitNumber(a.unitNumber)) - SIZE_ORDER.indexOf(sizeFromUnitNumber(b.unitNumber))
  if (sizeDiff !== 0) return sizeDiff
  return a.unitNumber.localeCompare(b.unitNumber)
}

const EMPTY_FORM = { warehouseId: 1, unitNumber: '', size: 'S', zone: '', monthlyPrice: '' }
const EMPTY_CONTRACT_FORM = { contractId: '', unitId: '', customerName: '', customerPhone: '', customerAddress: '', startDate: '', endDate: '', totalPrice: '', memo: '' }

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [sizeFilter, setSizeFilter] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [statusModal, setStatusModal] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [contractModal, setContractModal] = useState(null)
  const [contractForm, setContractForm] = useState(EMPTY_CONTRACT_FORM)

  async function load() {
    const [unitsRes, contractsRes] = await Promise.all([
      client.get('/admin/units'),
      client.get('/admin/contracts?status=ACTIVE&size=500'),
    ])
    const unitList = unitsRes.data.content ?? unitsRes.data
    const contractList = contractsRes.data.content ?? contractsRes.data
    const contractByUnit = {}
    for (const c of contractList) contractByUnit[c.unitId] = c

    const merged = unitList.map((unit) => {
      const c = contractByUnit[unit.id] ?? null
      return {
        id: unit.id,
        contractId: c?.id ?? null,
        unitId: unit.id,
        unitNumber: unit.unitNumber,
        size: unit.size,
        zone: unit.zone,
        monthlyPrice: unit.monthlyPrice,
        status: c
          ? (['RESERVED', 'DISABLED'].includes(unit.status) ? unit.status : c.status)
          : (unit.status ?? 'AVAILABLE'),
        customerName: c?.customerName ?? null,
        customerPhone: c?.customerPhone ?? null,
        customerAddress: c?.customerAddress ?? null,
        createdAt: c?.createdAt ?? null,
        startDate: c?.startDate ?? null,
        endDate: c?.endDate ?? null,
        totalPrice: c?.totalPrice ?? null,
        memo: c?.memo ?? null,
        expiringSoon: c?.expiringSoon ?? false,
      }
    })
    setUnits(merged)
    setSelectedUnit(null)
  }

  useEffect(() => { load() }, [])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }
  function setContract(k, v) { setContractForm((p) => ({ ...p, [k]: v })) }

  function applyDuration(months) {
    if (!contractForm.startDate) return
    const d = new Date(contractForm.startDate)
    d.setMonth(d.getMonth() + months)
    d.setDate(d.getDate() - 1)
    setContractForm((p) => ({ ...p, endDate: d.toISOString().slice(0, 10) }))
  }

  function extendEndDate(months) {
    if (!contractForm.endDate) return
    const d = new Date(contractForm.endDate)
    d.setMonth(d.getMonth() + months)
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    if (daysInMonth === 31) d.setDate(d.getDate() - 1)
    setContractForm((p) => ({ ...p, endDate: d.toISOString().slice(0, 10) }))
  }

  function openCreate() { setForm(EMPTY_FORM); setModal('create') }

  function openNewContract() {
    setContractForm(EMPTY_CONTRACT_FORM)
    setContractModal('create')
  }

  async function saveNewContract() {
    await client.post('/admin/contracts', {
      unitId: Number(contractForm.unitId),
      customerName: contractForm.customerName,
      customerPhone: contractForm.customerPhone,
      customerAddress: contractForm.customerAddress,
      startDate: contractForm.startDate,
      endDate: contractForm.endDate,
      totalPrice: Number(contractForm.totalPrice),
      memo: contractForm.memo || null,
    })
    setContractModal(null)
    load()
  }

  async function openContractEdit(row) {
    const res = await client.get(`/admin/contracts/${row.contractId}`)
    const c = res.data
    setContractForm({
      contractId: c.id,
      unitId: c.unitId,
      customerName: c.customerName ?? '',
      customerPhone: c.customerPhone ?? '',
      customerAddress: c.customerAddress ?? '',
      startDate: c.startDate ?? '',
      endDate: c.endDate ?? '',
      totalPrice: c.totalPrice ?? '',
      memo: c.memo ?? '',
    })
    setContractModal('edit')
  }

  async function saveContractEdit() {
    await client.put(`/admin/contracts/${contractForm.contractId}`, {
      unitId: contractForm.unitId,
      customerName: contractForm.customerName,
      customerPhone: contractForm.customerPhone,
      customerAddress: contractForm.customerAddress,
      startDate: contractForm.startDate,
      endDate: contractForm.endDate,
      totalPrice: Number(contractForm.totalPrice),
      memo: contractForm.memo || null,
    })
    setContractModal(null)
    load()
  }

  function terminateContract(row) {
    setConfirmModal({
      message: `계약 #${row.contractId}을 해지할까요?`,
      onConfirm: async () => {
        await client.patch(`/admin/contracts/${row.contractId}/terminate`)
        setConfirmModal(null)
        load()
      },
    })
  }

  async function saveCreate() {
    await client.post('/admin/units', { ...form, monthlyPrice: Number(form.monthlyPrice) })
    setModal(null); load()
  }

  async function changeStatus(unitId, status) {
    await client.patch(`/admin/units/${unitId}/status`, { status })
    setStatusModal(null); load()
  }

  const columns = [
    { key: 'unitNumber', label: '유닛 번호', sortable: true, width: '100px', render: (v) => (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-extrabold text-slate-900"
        style={{ backgroundColor: SIZE_COLOR[sizeFromUnitNumber(v)] ?? '#e2e8f0' }}
      >
        {v}
      </span>
    )},
    { key: 'customerName', label: '사용 고객', sortable: true, width: '110px', render: (v) => v ? <span className="font-semibold">{v}</span> : '-' },
    { key: 'customerPhone', label: '연락처', width: '140px', sortable: false, render: (v) => v ?? '-' },
    { key: 'createdAt', label: '계약 일자', sortable: true, width: '120px', render: (v) => v ? v.slice(0, 10) : '-' },
    { key: 'startDate', label: '시작일', sortable: true, width: '120px', render: (v) => v ?? '-' },
    { key: 'endDate', label: '만료 예정일', sortable: true, width: '120px',
      cellClass: () => sizeFilter === null ? 'bg-orange-50' : '',
      render: (v, row) => v
        ? <span className={row.expiringSoon ? 'text-orange-600 font-bold' : ''}>{v}</span>
        : '-' },
    { key: 'totalPrice', label: '계약 금액', sortable: true, width: '120px', render: (v) => v != null ? <span className="font-semibold">{Number(v).toLocaleString()}원</span> : '-' },
    { key: 'status', label: '상태', sortable: true, width: '110px', render: (v, row) => (
      row.expiringSoon && row.status === 'ACTIVE'
        ? <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-500">만료 임박</span>
        : <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CLASS[v] ?? 'bg-slate-100 text-slate-500'}`}>{STATUS_LABELS[v] ?? v}</span>
    )},
    { key: 'customerAddress', label: '주소', width: '180px', render: (v) => v ?? '-' },
    { key: 'memo', label: '기타', width: '220px', render: (v) => v
      ? <span title={v} className="block max-w-[220px] truncate">{v}</span>
      : '' },
  ]

  return (
    <div className="p-12 px-14 max-w-[1700px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">유닛 관리</h1>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={openNewContract}>+ 새로운 계약</button>
          <button className="btn-outline" onClick={openCreate}>+ 유닛 추가</button>
        </div>
      </div>

      <WarehouseGrid units={units} adminMode />

      <DataTable
        key={sizeFilter}
        columns={columns}
        rows={sizeFilter
          ? units
              .filter((u) => sizeFromUnitNumber(u.unitNumber) === sizeFilter)
              .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }))
          : [...units].sort(unitSort)
        }
        selectedId={selectedUnit?.id}
        onSelect={setSelectedUnit}
        rowClass={(row) => row.status === 'RESERVED' ? 'bg-yellow-100 hover:bg-yellow-200' : row.status === 'DISABLED' ? 'bg-slate-200 text-slate-400 hover:bg-slate-300' : ''}
        headerExtra={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border-[1.5px] ${sizeFilter === null ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}
                onClick={() => setSizeFilter(null)}
              >전체</button>
              {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
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
            {selectedUnit && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                {selectedUnit.status === 'ACTIVE' && (
                  <>
                    <button className="btn-sm btn-edit" onClick={() => openContractEdit(selectedUnit)}>계약 수정</button>
                    <button className="btn-sm btn-delete" onClick={() => terminateContract(selectedUnit)}>만료/해지</button>
                  </>
                )}
                <button className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => setStatusModal(selectedUnit)}>상태 변경</button>
              </div>
            )}
          </div>
        }
      />

      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[440px] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 rounded-t-2xl px-7 py-5 shrink-0">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 mb-0.5">유닛 관리</p>
              <h2 className="text-[19px] font-extrabold tracking-tight text-white">유닛 추가</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1.5">유닛 번호</label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    value={form.unitNumber}
                    onChange={(e) => set('unitNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1.5">사이즈</label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    value={form.size}
                    onChange={(e) => set('size', e.target.value)}
                  >
                    {SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1.5">구역</label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    value={form.zone}
                    onChange={(e) => set('zone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block mb-1.5">월 임대료</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    value={form.monthlyPrice ? Number(form.monthlyPrice).toLocaleString() : ''}
                    onChange={(e) => set('monthlyPrice', e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button className="px-5 py-2 rounded-full text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all" onClick={() => setModal(null)}>취소</button>
              <button className="px-6 py-2 rounded-full text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-all" onClick={saveCreate}>저장</button>
            </div>
          </div>
        </div>
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

      {contractModal === 'edit' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={() => setContractModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 rounded-t-2xl px-7 py-5 shrink-0">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 mb-0.5">계약 관리</p>
              <h2 className="text-[19px] font-extrabold tracking-tight text-white">계약 수정</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">고객 정보</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">고객명 *</label>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.customerName}
                      onChange={(e) => setContract('customerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">연락처 *</label>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.customerPhone}
                      onChange={(e) => setContract('customerPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">주소</label>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.customerAddress}
                      onChange={(e) => setContract('customerAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">계약 기간</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">시작일 *</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.startDate}
                      onChange={(e) => setContract('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">종료일 *</label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                        value={contractForm.endDate}
                        onChange={(e) => setContract('endDate', e.target.value)}
                      />
                      {[1, 3, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="shrink-0 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={!contractForm.endDate}
                          onClick={() => extendEndDate(m)}
                        >+{m}M</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">금액</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">계약 금액 *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    value={contractForm.totalPrice ? Number(contractForm.totalPrice).toLocaleString() : ''}
                    onChange={(e) => setContract('totalPrice', e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">기타</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                    value={contractForm.memo}
                    onChange={(e) => setContract('memo', e.target.value)}
                    placeholder="기타 사항을 입력하세요"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button className="px-5 py-2 rounded-full text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all" onClick={() => setContractModal(null)}>취소</button>
              <button className="px-6 py-2 rounded-full text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-all" onClick={() => setConfirmModal({
                message: '계약 정보를 저장하시겠습니까?',
                confirmLabel: '저장',
                confirmClass: 'bg-orange-500 hover:bg-orange-600',
                onConfirm: async () => { setConfirmModal(null); await saveContractEdit() },
              })}>저장</button>
            </div>
          </div>
        </div>
      )}

      {contractModal === 'create' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={() => setContractModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 rounded-t-2xl px-7 py-5 shrink-0">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 mb-0.5">계약 관리</p>
              <h2 className="text-[19px] font-extrabold tracking-tight text-white">새로운 계약</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">고객 정보</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">유닛 *</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.unitId}
                      onChange={(e) => setContract('unitId', e.target.value)}
                    >
                      <option value="">유닛 선택</option>
                      {units.filter((u) => u.status === 'AVAILABLE').sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)).map((u) => (
                        <option key={u.id} value={u.id}>{u.unitNumber} ({u.size})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">고객명 *</label>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.customerName}
                      onChange={(e) => setContract('customerName', e.target.value)}
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">연락처 *</label>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.customerPhone}
                      onChange={(e) => setContract('customerPhone', e.target.value)}
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">주소</label>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.customerAddress}
                      onChange={(e) => setContract('customerAddress', e.target.value)}
                      placeholder="서울시 강남구 ..."
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">계약 기간</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">시작일 *</label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                        value={contractForm.startDate}
                        onChange={(e) => setContract('startDate', e.target.value)}
                      />
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="shrink-0 px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={!contractForm.startDate}
                          onClick={() => applyDuration(m)}
                        >{m}M</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">종료일 *</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.endDate}
                      onChange={(e) => setContract('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">금액</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">계약 금액 *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      value={contractForm.totalPrice ? Number(contractForm.totalPrice).toLocaleString() : ''}
                      onChange={(e) => setContract('totalPrice', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                    />
                    {[10, 15, 20].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        className="shrink-0 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={!contractForm.totalPrice}
                        onClick={() => setContract('totalPrice', String(Math.round(Number(contractForm.totalPrice) * (1 - rate / 100))))}
                      >-{rate}%</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">기타</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                    value={contractForm.memo}
                    onChange={(e) => setContract('memo', e.target.value)}
                    placeholder="기타 사항을 입력하세요"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button className="px-5 py-2 rounded-full text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all" onClick={() => setContractModal(null)}>취소</button>
              <button className="px-6 py-2 rounded-full text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-all" onClick={() => setConfirmModal({
                message: '새로운 계약을 저장하시겠습니까?',
                confirmLabel: '저장',
                confirmClass: 'bg-orange-500 hover:bg-orange-600',
                onConfirm: async () => { setConfirmModal(null); await saveNewContract() },
              })}>저장</button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[380px] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 rounded-t-2xl px-7 py-5 shrink-0">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 mb-0.5">유닛 상태</p>
              <h2 className="text-[19px] font-extrabold tracking-tight text-white">{statusModal.unitNumber}</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-2.5">
                {STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s]
                  const active = statusModal.status === s
                  return (
                    <button
                      key={s}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${active ? cfg.ring : cfg.idle}`}
                      onClick={() => changeStatus(statusModal.unitId, s)}
                    >
                      <span className="text-[18px] block mb-1 leading-none">{cfg.symbol}</span>
                      <span className="text-[13px] font-bold block">{cfg.label}</span>
                      <span className="text-[11px] opacity-60 block mt-0.5">{cfg.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end shrink-0">
              <button className="px-5 py-2 rounded-full text-[13px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all" onClick={() => setStatusModal(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
