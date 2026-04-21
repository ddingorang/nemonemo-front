import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import DataTable from '../../components/DataTable.jsx'

const STATUS_LABELS = { ACTIVE: '사용 중', EXPIRED: '만료', TERMINATED: '해지' }
const STATUS_CLASS = { ACTIVE: 'bg-green-100 text-green-700', EXPIRED: 'bg-slate-100 text-slate-500', TERMINATED: 'bg-red-100 text-red-500' }
const STATUS_FILTERS = [
  { value: null, label: '전체' },
  { value: 'ACTIVE', label: '사용 중' },
  { value: 'EXPIRED', label: '만료' },
  { value: 'TERMINATED', label: '해지' },
]
const SIZE_COLOR = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }
function sizeFromUnitNumber(unitNumber) { return unitNumber?.split('-')[0] ?? '' }

function toYearMonth(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export default function ContractsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [statusFilter, setStatusFilter] = useState(null)
  const [contracts, setContracts] = useState([])
  const [total, setTotal] = useState(0)

  async function load(y, m, status) {
    const yearMonth = toYearMonth(y, m)
    const params = new URLSearchParams({ yearMonth, size: 500, sort: 'startDate,desc' })
    if (status) params.set('status', status)
    const res = await client.get(`/admin/contracts?${params}`)
    const list = res.data?.content ?? res.data ?? []
    setContracts(list)
    setTotal(res.data?.totalElements ?? list.length)
  }

  useEffect(() => { load(year, month, statusFilter) }, [year, month, statusFilter])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const totalRevenue = contracts.reduce((sum, c) => sum + Number(c.totalPrice ?? 0), 0)

  const columns = [
    { key: 'unitNumber', label: '유닛', sortable: true, width: '100px', render: (v) => (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-extrabold text-slate-900"
        style={{ backgroundColor: SIZE_COLOR[sizeFromUnitNumber(v)] ?? '#e2e8f0' }}
      >
        {v}
      </span>
    )},
    { key: 'customerName', label: '고객명', sortable: true, width: '110px' },
    { key: 'customerPhone', label: '연락처', width: '140px' },
    { key: 'customerAddress', label: '주소', width: '200px', render: (v) => v ?? '-' },
    { key: 'startDate', label: '시작일', sortable: true, width: '110px', render: (v) => v ?? '-' },
    { key: 'endDate', label: '종료일', sortable: true, width: '110px', render: (v, row) => v
      ? <span className={row.expiringSoon ? 'text-orange-600 font-bold' : ''}>{v}</span>
      : '-' },
    { key: 'totalPrice', label: '계약 금액', sortable: true, width: '130px', render: (v) => v != null ? `${Number(v).toLocaleString()}원` : '-' },
    { key: 'status', label: '상태', sortable: true, width: '90px', render: (v, row) => (
      row.expiringSoon && v === 'ACTIVE'
        ? <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-500">만료 임박</span>
        : <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CLASS[v] ?? 'bg-slate-100 text-slate-500'}`}>{STATUS_LABELS[v] ?? v}</span>
    )},
    { key: 'memo', label: '기타', width: '180px', render: (v) => v
      ? <span title={v} className="block max-w-[180px] truncate text-slate-500">{v}</span>
      : '' },
  ]

  return (
    <div className="p-12 px-14 max-w-[1600px]">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">계약 조회</h1>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex flex-col items-center mb-6 gap-2">
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all font-bold text-[24px]"
            onClick={prevMonth}
          >‹</button>
          <span className="text-[26px] font-extrabold tracking-tight text-slate-900 w-[180px] text-center">
            {year}년 {String(month).padStart(2, '0')}월
          </span>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all font-bold text-[24px]"
            onClick={nextMonth}
          >›</button>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <span className="text-slate-400">총 <span className="font-bold text-slate-700">{contracts.length}건</span></span>
          <span className="text-slate-200">|</span>
          <span className="text-slate-400">합계 <span className="font-bold text-orange-500">{totalRevenue.toLocaleString()}원</span></span>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={contracts}
        headerExtra={
          <div className="flex gap-1">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={String(value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border-[1.5px] ${
                  statusFilter === value
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                }`}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />
    </div>
  )
}
