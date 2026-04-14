// Created: 2026-04-09 23:36:28
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

const SIZE_ORDER = { XS: 0, S: 1, M: 2, L: 3, XL: 4 }
const SIZE_LABEL = { XS: '극소형', S: '소형', M: '중형', L: '대형', XL: '특대형' }
const SIZE_DIMS = { XS: '115 × 105 × 115 cm', S: '115 × 105 × 240 cm', M: '115 × 170 × 240 cm', L: '115 × 230 × 240 cm', XL: '210 × 240 × 240 cm' }

const NAVY = '#1a2238'
const NAVY_DEEP = '#111827'

const SIZE_COLOR = {
  XS: '#818cf8',
  S:  '#4ade80',
  M:  '#38bdf8',
  L:  '#fb923c',
  XL: '#f43f5e',
}

// 상태별 오버레이 색상 (사이즈 색상 위에 씌움)
function statusOverlay(unit) {
  if (unit.status === 'AVAILABLE') return null
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return 'rgba(0,0,0,0.22)'
  if (unit.status === 'OCCUPIED') return 'rgba(0,0,0,0.35)'
  if (unit.status === 'RESERVED') return 'rgba(255,255,255,0.32)'
  return 'rgba(15,23,42,0.58)' // MAINTENANCE
}

// 만료 임박 여부 (테두리로 강조)
function isExpiring(unit) {
  return unit.status === 'OCCUPIED' && unit.expiringSoon
}

function unitColorLabel(unit) {
  if (unit.status === 'AVAILABLE') return '이용 가능'
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return '만료 임박 (7일 이내)'
  if (unit.status === 'OCCUPIED') return '사용 중'
  if (unit.status === 'RESERVED') return '예약됨'
  return '점검 중'
}

// 툴팁 뱃지용
function statusBadgeStyle(unit) {
  if (unit.status === 'AVAILABLE') return { backgroundColor: '#4ade80' }
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return { backgroundColor: '#fbbf24' }
  if (unit.status === 'OCCUPIED') return { backgroundColor: '#f97316' }
  if (unit.status === 'RESERVED') return { backgroundColor: '#fdba74' }
  return { backgroundColor: '#cbd5e1' }
}

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: '24시간 CCTV 보안',
    desc: '전 구역 HD 카메라 및 보안 시스템으로 고객의 물건을 항시 보호합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: '365일 자유 입출',
    desc: '공휴일·심야 관계없이 본인 인증 후 언제든지 유닛에 자유롭게 출입 가능합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
    title: '온·습도 자동 관리',
    desc: '계절에 관계없이 적정 온도와 습도를 자동으로 유지해 물건의 변형·손상을 방지합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: '다양한 유닛 사이즈',
    desc: 'XS 개인 물품부터 XL 사무실 자재까지, 필요에 딱 맞는 크기를 합리적인 가격에 이용하세요.',
  },
]

export default function HomePage() {
  const [units, setUnits] = useState([])
  const [hovered, setHovered] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/units').then((res) => {
      const sorted = [...res.data].sort((a, b) => {
        if (SIZE_ORDER[a.size] !== SIZE_ORDER[b.size]) return SIZE_ORDER[a.size] - SIZE_ORDER[b.size]
        return a.unitNumber.localeCompare(b.unitNumber)
      })
      setUnits(sorted)
    })
  }, [])

  const stats = {
    available: units.filter((u) => u.status === 'AVAILABLE').length,
    occupied: units.filter((u) => u.status === 'OCCUPIED' && !u.expiringSoon).length,
    expiring: units.filter((u) => u.expiringSoon).length,
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10" style={{ backgroundColor: NAVY }}>
        <div className="max-w-[1160px] mx-auto px-8 h-[68px] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: '#f97316' }}>N</span>
            <span className="text-white font-extrabold text-[17px] tracking-tight">네모네모 스토리지</span>
          </div>
          <button
            className="text-white/80 hover:text-white text-[13px] font-semibold border border-white/20 hover:border-white/50 px-4 py-1.5 rounded-md transition-all duration-200"
            onClick={() => navigate('/admin/login')}
          >
            관리자 로그인
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-white py-28 px-8" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 55%, #1e3a5f 100%)` }}>
        {/* 격자 패턴 오버레이 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* 오렌지 글로우 */}
        <div className="absolute right-0 top-0 w-[600px] h-[600px] pointer-events-none opacity-10 rounded-full -translate-y-1/3 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />

        <div className="max-w-[780px] mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase mb-8 border"
            style={{ backgroundColor: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.35)', color: '#fdba74' }}>
            강남 1호점 &nbsp;·&nbsp; OPEN
          </div>
          <h1 className="text-[52px] font-black leading-[1.18] tracking-tight mb-6">
            내 소중한 물건,<br />
            <span style={{ color: '#fb923c' }}>안전하고 편리하게</span><br />
            보관하세요
          </h1>
          <p className="text-[17px] leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            XS부터 XL까지 총 50개 유닛 운영 중 · 서울 강남구<br />
            지금 바로 빈 유닛을 확인하고 예약 문의하세요.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/inquiry')}
              className="px-8 py-3.5 rounded-lg font-extrabold text-white text-[15px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: '#f97316', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}
            >
              예약 문의하기 →
            </button>
            <button
              onClick={() => document.getElementById('unit-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-lg font-semibold text-[15px] transition-all duration-200 hover:bg-white/10 border"
              style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              현황 보기
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div style={{ backgroundColor: '#f97316' }}>
        <div className="max-w-[1160px] mx-auto px-8 py-0">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-orange-400">
            {[
              { label: '24시간 보안 CCTV', sub: '전 구역 모니터링' },
              { label: '365일 자유 입출', sub: '언제든지 내 유닛으로' },
              { label: '온·습도 자동 관리', sub: '물건 변형 걱정 없이' },
              { label: '월정액 간편 요금', sub: '숨겨진 비용 없음' },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center justify-center py-4 px-4 text-center">
                <span className="text-white font-extrabold text-[13px] tracking-tight">{t.label}</span>
                <span className="text-orange-100 text-[11px] mt-0.5">{t.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Unit Grid ── */}
      <section id="unit-grid" className="py-16 px-8 bg-white">
        <div className="max-w-[1160px] mx-auto">
          <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
            <div>
              <p className="text-[12px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#f97316' }}>AVAILABILITY</p>
              <h2 className="text-[26px] font-black text-slate-900 tracking-tight">실시간 창고 현황</h2>
            </div>
            <div className="flex flex-col items-end gap-2.5">
              {/* 사이즈 색상 범례 */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {Object.entries(SIZE_COLOR).map(([size, color]) => (
                  <span key={size} className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                    {size}
                  </span>
                ))}
              </div>
              {/* 상태 범례 */}
              <div className="flex items-center gap-3 text-[12px] text-slate-400 flex-wrap justify-end">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-slate-300 shrink-0" />이용 가능 <strong className="text-slate-500">({stats.available})</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-slate-500 shrink-0" />사용 중 <strong className="text-slate-500">({stats.occupied})</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-slate-300 shrink-0 ring-2 ring-amber-400 ring-offset-1" />만료 임박 <strong className="text-slate-500">({stats.expiring})</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 md:p-8 border-2 border-slate-100" style={{ backgroundColor: '#f8fafc' }}>
            <div className="grid grid-cols-10 gap-2">
              {units.map((unit) => {
                const overlay = statusOverlay(unit)
                const expiring = isExpiring(unit)
                return (
                  <div
                    key={unit.id}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-default transition-all duration-150 hover:scale-110 hover:shadow-lg hover:z-10 relative overflow-hidden"
                    style={{
                      backgroundColor: SIZE_COLOR[unit.size],
                      boxShadow: hovered?.id === unit.id
                        ? '0 0 0 2.5px #f97316'
                        : expiring
                        ? '0 0 0 2.5px #fbbf24'
                        : undefined,
                    }}
                    onMouseEnter={() => setHovered(unit)}
                    onMouseLeave={() => setHovered(null)}
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                  >
                    {overlay && (
                      <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
                    )}
                    <span className="relative z-10 text-[13px] font-black leading-none text-white/80">{unit.size}</span>
                    <span className="relative z-10 text-[11px] font-bold leading-none text-white/60">{unit.unitNumber.slice(-2)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="text-center text-[12px] text-slate-400 mt-4">
            유닛 위에 마우스를 올리면 상세 정보를 확인할 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold tracking-widest uppercase mb-2" style={{ color: '#fb923c' }}>WHY NEMONEMO</p>
            <h2 className="text-[28px] font-black text-white tracking-tight">네모네모를 선택하는 이유</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-7 border border-white/10 hover:border-orange-400/50 transition-all duration-200 group" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-orange-400 group-hover:text-orange-300 transition-colors" style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
                  {f.icon}
                </div>
                <h3 className="text-white font-extrabold text-[15px] mb-2 tracking-tight">{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Size Guide ── */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold tracking-widest uppercase mb-2" style={{ color: '#f97316' }}>UNIT SIZES</p>
            <h2 className="text-[28px] font-black text-slate-900 tracking-tight mb-3">유닛 사이즈 안내</h2>
            <p className="text-slate-500 text-[15px]">필요한 크기에 딱 맞는 보관 공간을 선택하세요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { size: 'XS', desc: '극소형', price: '66,000', count: null, example: '개인 물품·소형 박스' },
              { size: 'S', desc: '소형', price: '99,000', count: 25, example: '짐 박스 10~15개' },
              { size: 'M', desc: '중형', price: '154,000', count: 10, example: '원룸 이사짐' },
              { size: 'L', desc: '대형', price: '198,000', count: 10, example: '투룸 이사짐' },
              { size: 'XL', desc: '특대형', price: '330,000', count: 5, example: '사무실 자재·비품' },
            ].map((s) => (
              <div key={s.size} className="rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-orange-300 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group">
                <div className="h-1.5" style={{ backgroundColor: '#f97316' }} />
                <div className="p-7 text-center">
                  <div className="inline-flex items-center justify-center text-white font-black text-[20px] w-[56px] h-[56px] rounded-xl mb-5 shadow-lg"
                    style={{ backgroundColor: NAVY }}>
                    {s.size}
                  </div>
                  <div className="font-extrabold text-slate-900 text-[17px] mb-1">{s.desc}</div>
                  <div className="text-slate-400 text-[12px] mb-5">{SIZE_DIMS[s.size]}</div>
                  <div className="border-t border-slate-100 pt-5">
                    <div className="font-extrabold text-[20px] mb-2" style={{ color: '#f97316' }}>
                      월 {s.price}원~
                    </div>
                    <div className="text-slate-500 text-[13px] mb-2">{s.example}</div>
                    {s.count && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>
                        총 {s.count}개 유닛
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotion ── */}
      <section className="py-20 px-8" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold tracking-widest uppercase mb-2" style={{ color: '#f97316' }}>LONG-TERM DISCOUNT</p>
            <h2 className="text-[28px] font-black text-slate-900 tracking-tight mb-3">장기 계약 특별 할인</h2>
            <p className="text-slate-500 text-[15px]">계약 기간이 길수록 더 큰 혜택을 드립니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                months: 3, discount: 10, badge: null,
                accentBorder: '#fed7aa',
                benefits: ['3개월 선결제', 'S 기준 월 89,100원~', '중도 해지 시 차액 환불'],
              },
              {
                months: 6, discount: 15, badge: '인기',
                accentBorder: '#f97316',
                benefits: ['6개월 선결제', 'S 기준 월 84,150원~', '중도 해지 시 차액 환불'],
              },
              {
                months: 12, discount: 20, badge: '최대 혜택',
                accentBorder: '#1a2238',
                benefits: ['12개월 선결제', 'S 기준 월 79,200원~', '중도 해지 시 차액 환불'],
              },
            ].map((p) => {
              const isHighlight = p.months === 12
              return (
                <div
                  key={p.months}
                  className="rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative"
                  style={{ borderColor: p.accentBorder, backgroundColor: isHighlight ? NAVY : '#fff' }}
                >
                  {p.badge && (
                    <div
                      className="absolute top-4 right-4 text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#f97316', color: '#fff' }}
                    >
                      {p.badge}
                    </div>
                  )}
                  <div className="h-1.5" style={{ backgroundColor: '#f97316' }} />
                  <div className="p-8 text-center">
                    <div
                      className="inline-flex items-center justify-center font-black text-[13px] tracking-widest px-4 py-1.5 rounded-full mb-5"
                      style={{
                        backgroundColor: isHighlight ? 'rgba(249,115,22,0.2)' : '#fff7ed',
                        color: isHighlight ? '#fb923c' : '#ea580c',
                      }}
                    >
                      {p.months}개월 계약
                    </div>
                    <div className="mb-1">
                      <span className="font-black text-[52px] leading-none" style={{ color: '#f97316' }}>
                        {p.discount}
                      </span>
                      <span className="font-extrabold text-[28px]" style={{ color: isHighlight ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}>%</span>
                    </div>
                    <div className="font-bold text-[15px] mb-6" style={{ color: isHighlight ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                      월 요금 할인
                    </div>
                    <div className="border-t pt-6 space-y-2.5" style={{ borderColor: isHighlight ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
                      {p.benefits.map((item) => (
                        <div key={item} className="flex items-center gap-2 justify-center text-[13px]" style={{ color: isHighlight ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" style={{ color: '#f97316' }}>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/inquiry')}
                      className="mt-7 w-full py-3 rounded-xl font-extrabold text-[14px] transition-all duration-200 hover:-translate-y-0.5"
                      style={isHighlight
                        ? { backgroundColor: '#f97316', color: '#fff', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }
                        : { backgroundColor: '#fff7ed', color: '#ea580c', border: '2px solid #fed7aa' }}
                    >
                      문의하기 →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-[12px] text-slate-400 mt-8">
            * 할인은 월 기본 요금 기준이며, 계약 시작일로부터 적용됩니다. 중도 해지 시 정상 요금과의 차액을 공제 후 환불됩니다.
          </p>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-8" style={{ background: `linear-gradient(135deg, #f97316 0%, #ea580c 100%)` }}>
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="text-[32px] font-black text-white tracking-tight mb-4">
            지금 바로 빈 유닛을 예약하세요
          </h2>
          <p className="text-orange-100 text-[15px] mb-9 leading-relaxed">
            원하는 사이즈와 입고 희망일을 알려주시면<br />빠르게 확인 후 연락드립니다.
          </p>
          <button
            onClick={() => navigate('/inquiry')}
            className="px-10 py-4 rounded-xl font-extrabold text-[16px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
            style={{ backgroundColor: NAVY_DEEP, color: '#fff', boxShadow: '0 6px 24px rgba(0,0,0,0.3)' }}
          >
            예약 문의하기 →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-8" style={{ backgroundColor: NAVY_DEEP }}>
        <div className="max-w-[1160px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: '#f97316' }}>N</span>
            <span className="text-white font-extrabold text-[15px] tracking-tight">네모네모 스토리지</span>
          </div>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © 2026 네모네모 스토리지 &nbsp;·&nbsp; 서울 강남구 &nbsp;·&nbsp; 문의: 02-0000-0000
          </p>
        </div>
      </footer>

      {/* ── Tooltip ── */}
      {hovered && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl text-[13px] leading-relaxed shadow-2xl border"
          style={{
            left: mousePos.x + 16,
            top: mousePos.y + 16,
            backgroundColor: NAVY_DEEP,
            borderColor: 'rgba(249,115,22,0.4)',
            color: 'rgba(255,255,255,0.85)',
            padding: '14px 18px',
          }}
        >
          <strong className="text-white">{hovered.unitNumber}</strong>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> · </span>
          {SIZE_LABEL[hovered.size]} ({hovered.size})
          <br />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{SIZE_DIMS[hovered.size]}</span>
          <br />
          <span style={{ color: '#fb923c', fontWeight: 700 }}>
            월 {Number(hovered.monthlyPrice).toLocaleString()}원
          </span>
          <br />
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-1.5 text-black/70" style={statusBadgeStyle(hovered)}>
            {unitColorLabel(hovered)}
          </span>
        </div>
      )}
    </div>
  )
}
