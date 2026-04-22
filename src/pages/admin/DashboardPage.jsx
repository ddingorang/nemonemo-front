// Created: 2026-04-19 21:06:02
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import client from '../../api/client.js'

const UNIT_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SIZE_COLORS = {
  XS: '#818cf8',
  S:  '#4ade80',
  M:  '#38bdf8',
  L:  '#fb923c',
  XL: '#f43f5e',
}

const SIZE_BADGE_COLORS = {
  XS: '#818cf8',
  S:  '#4ade80',
  M:  '#38bdf8',
  L:  '#fb923c',
  XL: '#f43f5e',
}

function formatRevenue(value) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
  return `${value.toLocaleString()}`
}

function toChartLabel(label, mode) {
  if (mode === 'monthly') return label.slice(5) + '월'
  return label.slice(5)
}

function buildChartData(items, mode) {
  return items.map((item) => ({
    label: toChartLabel(item.label, mode),
    ...Object.fromEntries(UNIT_SIZES.map((s) => [s, item.contractCountByUnitSize?.[s] ?? 0])),
    total: item.contractCount,
  }))
}

function buildRevenueChartData(items, mode) {
  return items.map((item) => ({
    label: toChartLabel(item.label, mode),
    ...Object.fromEntries(
      UNIT_SIZES.map((s) => [s, Math.round((item.totalRevenueByUnitSize?.[s] ?? 0) / 10000)]),
    ),
    total: Math.round((item.totalRevenue ?? 0) / 10000),
  }))
}

const CustomTooltipCount = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0)
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[12px]">
      <div className="font-bold text-slate-700 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-500">{p.dataKey}</span>
          <span className="ml-auto font-semibold text-slate-800">{p.value}건</span>
        </div>
      ))}
      <div className="border-t border-slate-100 mt-2 pt-2 font-bold text-slate-700 flex justify-between">
        <span>합계</span>
        <span>{total}건</span>
      </div>
    </div>
  )
}

const CustomTooltipRevenue = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0)
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[12px]">
      <div className="font-bold text-slate-700 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-500">{p.dataKey}</span>
          <span className="ml-auto font-semibold text-slate-800">{p.value.toLocaleString()}만원</span>
        </div>
      ))}
      <div className="border-t border-slate-100 mt-2 pt-2 font-bold text-slate-700 flex justify-between">
        <span>합계</span>
        <span>{total.toLocaleString()}만원</span>
      </div>
    </div>
  )
}

function StatsTable({ items, mode, valueKey, totalKey, formatCell, formatTotal }) {
  const grandTotal = items.reduce((sum, item) => sum + (item[totalKey] ?? 0), 0)
  const grandBySize = Object.fromEntries(
    UNIT_SIZES.map((s) => [s, items.reduce((sum, item) => sum + (item[valueKey]?.[s] ?? 0), 0)]),
  )

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-center p-2.5 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-16">
                기간
              </th>
              {UNIT_SIZES.map((s) => (
                <th key={s} className="text-right p-2.5 px-1.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: SIZE_COLORS[s] }}>
                  {s}
                </th>
              ))}
              <th className="text-right p-2.5 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">합계</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.label} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-2.5 px-2 font-semibold text-slate-600 text-center">
                  {toChartLabel(item.label, mode)}
                </td>
                {UNIT_SIZES.map((s) => (
                  <td key={s} className="p-2.5 px-1.5 text-right text-slate-700">
                    {item[valueKey]?.[s] ? formatCell(item[valueKey][s]) : <span className="text-slate-300">-</span>}
                  </td>
                ))}
                <td className="p-2.5 px-2 text-right font-bold text-slate-800">
                  {formatTotal(item[totalKey] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="p-2.5 px-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">합계</td>
              {UNIT_SIZES.map((s) => (
                <td key={s} className="p-2.5 px-1.5 text-right font-bold text-slate-700">
                  {grandBySize[s] ? formatCell(grandBySize[s]) : <span className="text-slate-300">-</span>}
                </td>
              ))}
              <td className="p-2.5 px-2 text-right font-extrabold text-orange-600">
                {formatTotal(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function makeRoundedBar(key) {
  return function RoundedTopBar({ x, y, width, height, fill, payload }) {
    if (!height || height <= 0 || !width || width <= 0) return null
    const idx = UNIT_SIZES.indexOf(key)
    const isTopmost = UNIT_SIZES.slice(idx + 1).every((s) => !(payload?.[s] > 0))
    if (!isTopmost) {
      return <rect x={x} y={y} width={width} height={height} fill={fill} />
    }
    const r = 4
    return (
      <path
        d={`M${x},${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} H${x} Z`}
        fill={fill}
      />
    )
  }
}

function StatsSection() {
  const [mode, setMode] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tableView, setTableView] = useState('count')

  useEffect(() => {
    setLoading(true)
    client
      .get(`/admin/dashboard/stats/${mode}`, { params: { year } })
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [mode, year])

  const countData = stats ? buildChartData(stats.items, mode) : []
  const revenueData = stats ? buildRevenueChartData(stats.items, mode) : []

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
          계약 통계
        </h2>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                mode === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
              }`}
            >
              월별
            </button>
            <button
              onClick={() => setMode('quarterly')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                mode === 'quarterly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
              }`}
            >
              분기별
            </button>
          </div>

          <div className="flex items-center gap-1 border border-slate-200 rounded-xl overflow-hidden text-[13px]">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 font-bold"
            >
              ‹
            </button>
            <span className="px-2 font-semibold text-slate-700">{year}년</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="px-3 py-1.5 hover:bg-slate-50 text-slate-500 font-bold"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 현재 조회 기간 + 연간 요약 */}
      <div className="flex items-center justify-between gap-6 mb-8 flex-wrap">
        <div>
          <span className="text-[32px] font-extrabold tracking-tight text-slate-900">{year}년</span>
          <span className="ml-3 text-[20px] font-semibold text-slate-400">{mode === 'monthly' ? '월별' : '분기별'} 통계</span>
        </div>
        {stats && (
          <div className="flex gap-4">
            <div className="bg-slate-50 rounded-2xl px-6 py-3 border border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">연간 계약 건수</div>
              <div className="text-[22px] font-extrabold text-slate-900">{stats.totalContractCount}건</div>
            </div>
            <div className="bg-orange-50 rounded-2xl px-6 py-3 border border-orange-100">
              <div className="text-[11px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">연간 계약 금액</div>
              <div className="text-[22px] font-extrabold text-orange-600">
                {Number(stats.totalRevenue).toLocaleString()}원
              </div>
            </div>
          </div>
        )}
      </div>

      {!stats ? (
        <div className="h-64 flex items-center justify-center text-slate-300 text-sm">불러오는 중...</div>
      ) : (
        <div className={`grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-14 items-start transition-opacity duration-150 ${loading ? 'opacity-40' : 'opacity-100'}`}>
            {/* 왼쪽: 차트 2개 세로 배치 */}
            <div className="flex flex-col gap-8">
              <div>
                <div className="text-[13px] font-bold text-slate-600 mb-4">유닛 타입별 계약 건수</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={countData} barSize={mode === 'monthly' ? 22 : 40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltipCount />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} payload={UNIT_SIZES.map((s) => ({ value: s, type: 'rect', color: SIZE_COLORS[s] }))} />
                    {UNIT_SIZES.map((size) => (
                      <Bar key={size} dataKey={size} stackId="a" fill={SIZE_COLORS[size]} shape={makeRoundedBar(size)} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div className="text-[13px] font-bold text-slate-600 mb-4">유닛 타입별 계약 금액 (만원)</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={revenueData} barSize={mode === 'monthly' ? 22 : 40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltipRevenue />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} payload={UNIT_SIZES.map((s) => ({ value: s, type: 'rect', color: SIZE_COLORS[s] }))} />
                    {UNIT_SIZES.map((size) => (
                      <Bar key={size} dataKey={size} stackId="a" fill={SIZE_COLORS[size]} shape={makeRoundedBar(size)} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 오른쪽: 토글 표 */}
            <div className="xl:w-[580px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-bold text-slate-600">
                  {tableView === 'count' ? '계약 건수 상세' : '계약 금액 상세'}
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setTableView('count')}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                      tableView === 'count' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    건수
                  </button>
                  <button
                    onClick={() => setTableView('revenue')}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                      tableView === 'revenue' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    금액
                  </button>
                </div>
              </div>
              {tableView === 'count' ? (
                <StatsTable
                  items={stats.items}
                  mode={mode}
                  valueKey="contractCountByUnitSize"
                  totalKey="contractCount"
                  formatCell={(v) => `${v}건`}
                  formatTotal={(v) => `${v}건`}
                />
              ) : (
                <StatsTable
                  items={stats.items}
                  mode={mode}
                  valueKey="totalRevenueByUnitSize"
                  totalKey="totalRevenue"
                  formatCell={(v) => `${Number(v).toLocaleString()}`}
                  formatTotal={(v) => `${Number(v).toLocaleString()}원`}
                />
              )}
            </div>
          </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    client.get('/admin/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="p-12 text-center text-slate-400">불러오는 중...</div>

  const { unitSummary: s, expiringThisMonth, pendingInquiryCount } = data

  return (
    <div className="p-12 px-14 max-w-[1440px]">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">대시보드</h1>
        <span className="text-[21px] font-extrabold tracking-tight text-slate-900">
          {(() => { const d = new Date(); return `${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,'0')}월 ${String(d.getDate()).padStart(2,'0')}일` })()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 px-7 border-[1.5px] border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">전체 유닛</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-slate-900">{s.total}</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 px-7 border-[1.5px] border-green-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-green-600/60 uppercase tracking-widest mb-3">이용 가능</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-green-600">{s.available}</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-6 px-7 border-[1.5px] border-orange-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-orange-600/60 uppercase tracking-widest mb-3">사용 중</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-orange-600">{s.occupied}</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 px-7 border-[1.5px] border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">비활성화</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-slate-400">{s.disabled}</div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-6 px-7 border-[1.5px] border-amber-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-amber-600/60 uppercase tracking-widest mb-3">만료 임박 (7일)</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-amber-600">{expiringThisMonth.length}</div>
        </div>
        <div className="bg-violet-50 rounded-2xl p-6 px-7 border-[1.5px] border-violet-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-violet-600/60 uppercase tracking-widest mb-3">미처리 문의</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-violet-600">{pendingInquiryCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
          만료 임박 계약 — 7일 이내 ({expiringThisMonth.length}건)
        </h2>
        {expiringThisMonth.length === 0 ? (
          <p className="text-slate-400 text-[13px] py-5">이번 달 만료 예정 계약이 없습니다.</p>
        ) : (
          <div className="bg-white rounded-2xl border-[1.5px] border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">유닛</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">고객명</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[150px]">연락처</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">시작일</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">종료일</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">잔여일</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">계약 금액</th>
                </tr>
              </thead>
              <tbody>
                {expiringThisMonth.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 px-4 border-b border-slate-100">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-extrabold text-slate-900"
                        style={{ backgroundColor: SIZE_BADGE_COLORS[c.unitNumber.split('-')[0]] ?? '#e2e8f0' }}
                      >
                        {c.unitNumber}
                      </span>
                    </td>
                    <td className="p-3 px-4 border-b border-slate-100">{c.customerName}</td>
                    <td className="p-3 px-4 border-b border-slate-100">{c.customerPhone}</td>
                    <td className="p-3 px-4 border-b border-slate-100">{c.startDate}</td>
                    <td className="p-3 px-4 border-b border-slate-100 text-yellow-600 font-semibold">{c.endDate}</td>
                    <td className="p-3 px-4 border-b border-slate-100">
                      {(() => {
                        const days = Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                        return (
                          <span className={`font-semibold ${days <= 7 ? 'text-red-500' : 'text-yellow-600'}`}>
                            D-{days}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="p-3 px-4 border-b border-slate-100">{Number(c.totalPrice).toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StatsSection />
    </div>
  )
}
