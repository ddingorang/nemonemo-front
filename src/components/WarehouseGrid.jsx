import { useState } from 'react'

const SIZE_LABEL = { XS: '극소형', S: '소형', M: '중형', L: '대형', XL: '특대형' }
const SIZE_DIMS  = { XS: '115 × 105 × 115 cm', S: '115 × 105 × 240 cm', M: '115 × 170 × 240 cm', L: '115 × 230 × 240 cm', XL: '210 × 240 × 240 cm' }
const SIZE_PRICE = { XS: 66000, S: 99000, M: 154000, L: 198000, XL: 330000 }
const SIZE_COLOR = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }

// 관리자 페이지의 계약 상태(ACTIVE)를 유닛 상태(OCCUPIED)로 정규화
function normalizeStatus(status) {
  if (status === 'ACTIVE') return 'OCCUPIED'
  if (status === 'EXPIRED' || status === 'TERMINATED') return 'AVAILABLE'
  return status
}

function statusOverlay(unit) {
  const s = normalizeStatus(unit.status)
  if (s === 'AVAILABLE') return null
  if (s === 'OCCUPIED' && unit.expiringSoon) return 'rgba(251,191,36,0.35)'
  if (s === 'OCCUPIED') return 'rgba(0,0,0,0.35)'
  if (s === 'RESERVED') return 'rgba(255,255,255,0.32)'
  return null
}

function unitColorLabel(unit) {
  const s = normalizeStatus(unit.status)
  if (s === 'AVAILABLE') return '이용 가능'
  if (s === 'OCCUPIED' && unit.expiringSoon) return '만료 임박 (7일 이내)'
  if (s === 'OCCUPIED') return '사용 중'
  if (s === 'RESERVED') return '예약됨'
  return '비활성화'
}

function statusBadgeStyle(unit) {
  const s = normalizeStatus(unit.status)
  if (s === 'AVAILABLE') return { backgroundColor: '#4ade80' }
  if (s === 'OCCUPIED' && unit.expiringSoon) return { backgroundColor: '#fbbf24' }
  if (s === 'OCCUPIED') return { backgroundColor: '#f97316' }
  if (s === 'RESERVED') return { backgroundColor: '#fdba74' }
  return { backgroundColor: '#cbd5e1' }
}

export default function WarehouseGrid({ units, adminMode = false }) {
  const [hovered, setHovered] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const bySize = (size) =>
    units.filter((u) => u.size === size).sort((a, b) => a.unitNumber.localeCompare(b.unitNumber))

  const xs    = bySize('XS')
  const sAll  = bySize('S')
  const mAll  = bySize('M')
  const lAll  = bySize('L')
  const xlAll = bySize('XL')

  const xsGrid  = Array(50).fill(null).map((_, i) => xs[i] ?? null)
  const sBlock1 = Array(50).fill(null).map((_, i) => sAll[i] ?? null)

  const sec3 = Array(50).fill(null)
  mAll.slice(0, 13).forEach((u, i) => { sec3[i] = u })
  sAll.slice(50, 57).forEach((u, i) => { sec3[13 + i] = u })
  mAll.slice(13, 26).forEach((u, i) => { sec3[25 + i] = u })
  lAll.slice(0, 11).forEach((u, i) => { sec3[38 + i] = u })

  const sec4 = Array(25).fill(null)
  sAll.slice(57, 60).forEach((u, i) => { sec4[i] = u })
  xlAll.slice(0, 4).forEach((u, i) => { sec4[3 + i] = u })

  const stats = {
    available: units.filter((u) => normalizeStatus(u.status) === 'AVAILABLE').length,
    occupied:  units.filter((u) => normalizeStatus(u.status) === 'OCCUPIED' && !u.expiringSoon).length,
    expiring:  units.filter((u) => u.expiringSoon).length,
  }

  function renderCell(unit, key, halfHeight = false) {
    if (!unit) return <div key={key} className={halfHeight ? 'h-10' : 'h-14'} />
    const overlay  = statusOverlay(unit)
    const expiring = normalizeStatus(unit.status) === 'OCCUPIED' && unit.expiringSoon
    return (
      <div
        key={unit.id}
        className={`${halfHeight ? 'h-10' : 'h-14'} rounded-[4px] flex items-center justify-center cursor-default transition-all duration-150 hover:scale-110 hover:z-10 relative overflow-hidden`}
        style={{
          backgroundColor: normalizeStatus(unit.status) === 'DISABLED' ? '#475569' : normalizeStatus(unit.status) === 'RESERVED' ? '#f59e0b' : SIZE_COLOR[unit.size],
          boxShadow: hovered?.id === unit.id
            ? '0 0 0 2px #f97316'
            : expiring
            ? '0 0 0 2.5px #f59e0b, 0 0 10px 3px rgba(245,158,11,0.55)'
            : undefined,
        }}
        onMouseEnter={() => setHovered(unit)}
        onMouseLeave={() => setHovered(null)}
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        {overlay && <div className={`absolute inset-0 ${expiring ? 'animate-pulse' : ''}`} style={{ backgroundColor: overlay }} />}
        <div className="relative z-10 flex flex-col items-center leading-none select-none gap-0.5">
          <span className="text-[11px] font-extrabold text-white/50">{unit.size}</span>
          <span className="text-[13px] font-black text-white/70">{unit.unitNumber.slice(-2)}</span>
        </div>
      </div>
    )
  }

  function renderSplitRows(cells, keyPrefix, halfHeight = false) {
    const COLS = 25, LEFT = 13
    const numRows = Math.ceil(cells.length / COLS)
    return Array.from({ length: numRows }, (_, r) => {
      const row = [...cells.slice(r * COLS, (r + 1) * COLS)]
      while (row.length < COLS) row.push(null)
      return (
        <div key={`${keyPrefix}-row-${r}`} style={{ display: 'flex', gap: '4px', marginBottom: r < numRows - 1 ? '4px' : 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, minmax(0, 1fr))', gap: '4px', flexGrow: 13, flexBasis: 0 }}>
            {row.slice(0, LEFT).map((u, i) => renderCell(u, `${keyPrefix}-${r}-L-${i}`, halfHeight))}
          </div>
          <div style={{ width: '20px', flexShrink: 0 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '4px', flexGrow: 12, flexBasis: 0 }}>
            {row.slice(LEFT).map((u, i) => renderCell(u, `${keyPrefix}-${r}-R-${i}`, halfHeight))}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
          실시간 창고 현황
        </h2>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {Object.entries(SIZE_COLOR).map(([size, color]) => (
              <span key={size} className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <span className="inline-block w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                {size}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-400 flex-wrap justify-end">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-sm bg-slate-300 shrink-0" />
              이용 가능 <strong className="text-slate-500">({stats.available})</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-sm bg-slate-500 shrink-0" />
              사용 중 <strong className="text-slate-500">({stats.occupied})</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-sm bg-slate-300 shrink-0 ring-2 ring-amber-400 ring-offset-1" />
              만료 임박 <strong className="text-slate-500">({stats.expiring})</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-slate-100 overflow-x-auto" style={{ backgroundColor: '#f8fafc' }}>
        <div style={{ minWidth: '900px' }}>
          <div className="grid gap-[4px]" style={{ gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}>
            {xsGrid.map((unit, i) => renderCell(unit, `xs-${i}`, true))}
          </div>
          <div className="my-4"><div className="border-t border-dashed border-slate-300" /></div>
          {renderSplitRows(sBlock1, 's1')}
          <div className="my-4"><div className="border-t border-dashed border-slate-300" /></div>
          {renderSplitRows(sec3, 's3')}
          <div className="my-4" />
          {renderSplitRows(sec4, 's4')}
        </div>
      </div>

      {hovered && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl text-[13px] leading-relaxed shadow-2xl border"
          style={{
            left: mousePos.x + 16,
            top: mousePos.y + 16,
            backgroundColor: '#111827',
            borderColor: 'rgba(249,115,22,0.4)',
            color: 'rgba(255,255,255,0.85)',
            padding: '14px 18px',
          }}
        >
          <strong className="text-white">{hovered.unitNumber}</strong>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> · </span>
          {SIZE_LABEL[hovered.size]} ({hovered.size})
          <br />
          {adminMode ? (
            normalizeStatus(hovered.status) === 'OCCUPIED' ? (
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                {hovered.customerName ?? '-'}
                <span style={{ color: 'rgba(255,255,255,0.4)' }}> · </span>
                {hovered.customerPhone ?? '-'}
                <br />
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {hovered.startDate ?? '-'} ~ {hovered.endDate ?? '-'}
                </span>
              </span>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>계약 없음</span>
            )
          ) : (
            <>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{SIZE_DIMS[hovered.size]}</span>
              <br />
              <span style={{ color: '#fb923c', fontWeight: 700 }}>
                월 {SIZE_PRICE[hovered.size].toLocaleString()}원
              </span>
            </>
          )}
          <br />
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-1.5 text-black/70" style={statusBadgeStyle(hovered)}>
            {unitColorLabel(hovered)}
          </span>
        </div>
      )}
    </div>
  )
}
