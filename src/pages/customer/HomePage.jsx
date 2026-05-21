// Created: 2026-05-14 22:41:30
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'
import { useReveal, revealClass, staggerDelay } from '../../hooks/useReveal.js'

const SIZE_ORDER   = { XS: 0, S: 1, M: 2, L: 3, XL: 4 }
const SIZE_LABEL   = { XS: '극소형', S: '소형', M: '중형', L: '대형', XL: '특대형' }
const SIZE_DIMS    = { XS: '115 × 105 × 115 cm', S: '115 × 105 × 240 cm', M: '115 × 170 × 240 cm', L: '115 × 230 × 240 cm', XL: '210 × 240 × 240 cm' }
const SIZE_PRICE   = { XS: 66000, S: 99000, M: 154000, L: 198000, XL: 330000 }
const SIZE_COUNT   = { S: 25, M: 10, L: 10, XL: 5 }
const SIZE_EXAMPLE = { XS: '개인 물품·소형 박스', S: '짐 박스 10~15개', M: '원룸 이사짐', L: '투룸 이사짐', XL: '사무실 자재·비품' }
const SIZE_COLOR   = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }

// Design tokens (DESIGN.md)
const FONT = "'Inter', 'SF Pro Display', system-ui, helvetica, sans-serif"
const MONO = "'JetBrains Mono', 'SF Mono', menlo, monospace"
const LIME  = '#dceeb1'
const CORAL = '#f3c9b6'
const NAVY  = '#1f1d3d'
const INK   = '#000000'
const CANVAS = '#ffffff'
const SURF   = '#f7f7f5'
const HAIR   = '#e6e6e6'
const ORANGE = '#f97316'

function statusOverlay(unit) {
  if (unit.status === 'AVAILABLE') return null
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return 'rgba(0,0,0,0.22)'
  if (unit.status === 'OCCUPIED') return 'rgba(0,0,0,0.35)'
  if (unit.status === 'RESERVED') return 'rgba(255,255,255,0.32)'
  return 'rgba(15,23,42,0.58)'
}
function isExpiring(unit) { return unit.status === 'OCCUPIED' && unit.expiringSoon }
function unitStatusLabel(unit) {
  if (unit.status === 'AVAILABLE') return '이용 가능'
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return '만료 임박 (7일 이내)'
  if (unit.status === 'OCCUPIED') return '사용 중'
  if (unit.status === 'RESERVED') return '예약됨'
  return '비활성화'
}
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: '24시간 CCTV 보안',
    desc: '전 구역 HD 카메라 및 보안 시스템으로 고객의 물건을 항시 보호합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: '365일 자유 입출',
    desc: '공휴일·심야 관계없이 본인 인증 후 언제든지 유닛에 자유롭게 출입 가능합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
    title: '온·습도 자동 관리',
    desc: '계절에 관계없이 적정 온도와 습도를 자동으로 유지해 물건의 변형·손상을 방지합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: '다양한 유닛 사이즈',
    desc: 'XS 개인 물품부터 XL 사무실 자재까지, 필요에 딱 맞는 크기를 합리적인 가격에 이용하세요.',
  },
]

const PROMOTIONS = [
  {
    months: 3, discount: 10, badge: null,
    benefits: ['3개월 선결제', 'S 기준 월 89,100원~', '중도 해지 시 차액 환불'],
  },
  {
    months: 6, discount: 15, badge: '인기',
    benefits: ['6개월 선결제', 'S 기준 월 84,150원~', '중도 해지 시 차액 환불'],
  },
  {
    months: 12, discount: 20, badge: '최대 혜택',
    benefits: ['12개월 선결제', 'S 기준 월 79,200원~', '중도 해지 시 차액 환불'],
  },
]

const MARQUEE_TEXT = 'NEMONEMO STORAGE  ·  강남 1호점 OPEN  ·  24시간 CCTV  ·  365일 자유 입출  ·  온습도 자동 관리  ·  서울 강남구  ·  총 100개 유닛  ·  월정액 요금  ·  '

export default function HomePage() {
  const [units, setUnits] = useState([])
  const [hovered, setHovered] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()

  const heroReveal     = useReveal({ threshold: 0.15 })
  const gridReveal     = useReveal()
  const featuresReveal = useReveal()
  const sizesReveal    = useReveal()
  const promoReveal    = useReveal()
  const ctaReveal      = useReveal()

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
    occupied:  units.filter((u) => u.status === 'OCCUPIED' && !u.expiringSoon).length,
    expiring:  units.filter((u) => u.expiringSoon).length,
  }

  const xs    = units.filter((u) => u.size === 'XS')
  const sAll  = units.filter((u) => u.size === 'S')
  const mAll  = units.filter((u) => u.size === 'M')
  const lAll  = units.filter((u) => u.size === 'L')
  const xlAll = units.filter((u) => u.size === 'XL')

  const xsGrid  = Array(50).fill(null).map((_, i) => xs[i] ?? null)
  const sBlock1 = Array(50).fill(null).map((_, i) => sAll[i] ?? null)
  const sec3 = Array(50).fill(null)
  mAll.slice(0, 13).forEach((u, i)  => { sec3[i]      = u })
  sAll.slice(50, 57).forEach((u, i) => { sec3[13 + i] = u })
  mAll.slice(13, 26).forEach((u, i) => { sec3[25 + i] = u })
  lAll.slice(0, 11).forEach((u, i)  => { sec3[38 + i] = u })
  const sec4 = Array(25).fill(null)
  sAll.slice(57, 60).forEach((u, i) => { sec4[i]     = u })
  xlAll.slice(0, 4).forEach((u, i)  => { sec4[3 + i] = u })

  function renderCell(unit, key, halfHeight = false) {
    if (!unit) return <div key={key} style={{ height: halfHeight ? 40 : 56 }} />
    const overlay = statusOverlay(unit)
    const expiring = isExpiring(unit)
    return (
      <div
        key={unit.id}
        style={{
          height: halfHeight ? 40 : 56,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.15s, box-shadow 0.15s',
          backgroundColor: SIZE_COLOR[unit.size],
          boxShadow: hovered?.id === unit.id ? `0 0 0 2px ${INK}` : expiring ? '0 0 0 2px #fbbf24' : undefined,
          transform: hovered?.id === unit.id ? 'scale(1.1)' : undefined,
          zIndex: hovered?.id === unit.id ? 10 : undefined,
        }}
        onMouseEnter={() => setHovered(unit)}
        onMouseLeave={() => setHovered(null)}
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        {overlay && <div style={{ position: 'absolute', inset: 0, backgroundColor: overlay }} />}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, gap: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>{unit.size}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{unit.unitNumber.slice(-2)}</span>
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
        <div key={`${keyPrefix}-row-${r}`} style={{ display: 'flex', gap: 4, marginBottom: r < numRows - 1 ? 4 : 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, minmax(0, 1fr))', gap: 4, flexGrow: 13, flexBasis: 0 }}>
            {row.slice(0, LEFT).map((u, i) => renderCell(u, `${keyPrefix}-${r}-L-${i}`, halfHeight))}
          </div>
          <div style={{ width: 20, flexShrink: 0 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 4, flexGrow: 12, flexBasis: 0 }}>
            {row.slice(LEFT).map((u, i) => renderCell(u, `${keyPrefix}-${r}-R-${i}`, halfHeight))}
          </div>
        </div>
      )
    })
  }

  return (
    <div style={{ fontFamily: FONT, backgroundColor: CANVAS, color: INK, minHeight: '100vh' }}>
      <style>{`
        @keyframes nemo-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .nemo-marquee { animation: nemo-marquee 32s linear infinite; display: flex; white-space: nowrap; }
        .pill-primary:hover  { opacity: 0.82; }
        .pill-secondary:hover { border-color: #999 !important; }
        .pill-ghost:hover { border-color: rgba(255,255,255,0.45) !important; }
      `}</style>

      {/* ── Top Nav ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        backgroundColor: CANVAS,
        borderBottom: `1px solid ${HAIR}`,
        height: 56,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 32px', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: ORANGE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: CANVAS, flexShrink: 0 }}>N</span>
            <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>네모네모 스토리지</span>
          </div>
          {localStorage.getItem('token') ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => navigate('/admin/dashboard')}
                style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: INK, backgroundColor: SURF, borderRadius: 9999, padding: '7px 16px', border: 'none', cursor: 'pointer' }}
              >
                관리자 페이지
              </button>
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.reload() }}
                style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: '#888', backgroundColor: 'transparent', borderRadius: 9999, padding: '7px 16px', border: 'none', cursor: 'pointer' }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/admin/login')}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: INK, backgroundColor: SURF, borderRadius: 9999, padding: '7px 16px', border: 'none', cursor: 'pointer' }}
            >
              관리자 로그인
            </button>
          )}
        </div>
      </header>

      {/* ── Marquee Strip ── */}
      <div style={{ backgroundColor: '#fb923c', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="nemo-marquee">
          {[MARQUEE_TEXT, MARQUEE_TEXT].map((t, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 11, color: '#7c2d12', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ backgroundColor: CANVAS, padding: '96px 32px' }}>
        <div ref={heroReveal.ref} style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div className={revealClass(heroReveal.visible)} style={{ ...staggerDelay(0), marginBottom: 28 }}>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.54px', textTransform: 'uppercase', color: ORANGE }}>
              강남 1호점 · Open
            </span>
          </div>
          <h1
            className={revealClass(heroReveal.visible)}
            style={{
              ...staggerDelay(1),
              fontFamily: FONT,
              fontSize: 'clamp(44px, 7vw, 86px)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: 'clamp(-0.8px, -0.02em, -1.72px)',
              color: INK,
              marginBottom: 28,
            }}
          >
            내 소중한 물건,<br />안전하게 보관하세요
          </h1>
          <p
            className={revealClass(heroReveal.visible)}
            style={{
              ...staggerDelay(2),
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: 1.65,
              letterSpacing: '-0.14px',
              color: '#666',
              maxWidth: 500,
              margin: '0 auto 44px',
            }}
          >
            XS부터 XL까지 총 100개 유닛 운영 중 · 서울 강남구<br />
            지금 바로 빈 유닛을 확인하고 예약 문의하세요.
          </p>
          <div className={revealClass(heroReveal.visible)} style={{ ...staggerDelay(3), display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="pill-primary"
              onClick={() => navigate('/inquiry')}
              style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, letterSpacing: '-0.1px', backgroundColor: ORANGE, color: CANVAS, borderRadius: 9999, padding: '11px 28px', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
            >
              예약 문의하기
            </button>
            <button
              className="pill-secondary"
              onClick={() => document.getElementById('unit-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, letterSpacing: '-0.1px', backgroundColor: CANVAS, color: INK, borderRadius: 9999, padding: '11px 28px', border: `1px solid ${HAIR}`, cursor: 'pointer', transition: 'border-color 0.15s' }}
            >
              현황 보기
            </button>
          </div>
        </div>
      </section>

      {/* ── Unit Grid ── */}
      <section id="unit-grid" style={{ backgroundColor: CANVAS, padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div ref={gridReveal.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div className={revealClass(gridReveal.visible)} style={staggerDelay(0)}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.54px', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>Availability</p>
              <h2 style={{ fontFamily: FONT, fontSize: 32, fontWeight: 300, letterSpacing: '-0.64px', lineHeight: 1.1 }}>실시간 창고 현황</h2>
            </div>
            <div className={revealClass(gridReveal.visible)} style={{ ...staggerDelay(1), display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {Object.entries(SIZE_COLOR).map(([size, color]) => (
                  <span key={size} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, backgroundColor: color }} />
                    {size}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {[
                  { label: `이용 가능 (${stats.available})`, bg: '#d4d4d4' },
                  { label: `사용 중 (${stats.occupied})`, bg: '#737373' },
                  { label: `만료 임박 (${stats.expiring})`, bg: '#d4d4d4', ring: '#fbbf24' },
                ].map(s => (
                  <span key={s.label} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, backgroundColor: s.bg, outline: s.ring ? `2px solid ${s.ring}` : undefined, outlineOffset: 2 }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`${revealClass(gridReveal.visible)} overflow-x-auto`}
            style={{ ...staggerDelay(2), borderRadius: 24, border: `1px solid ${HAIR}`, padding: '36px 40px', backgroundColor: SURF }}
          >
            <div style={{ minWidth: 900 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(25, minmax(0, 1fr))', gap: 4 }}>
                {xsGrid.map((unit, i) => renderCell(unit, `xs-${i}`, true))}
              </div>
              <div style={{ margin: '16px 0', borderTop: '1px dashed #d4d4d4' }} />
              {renderSplitRows(sBlock1, 's1')}
              <div style={{ margin: '16px 0', borderTop: '1px dashed #d4d4d4' }} />
              {renderSplitRows(sec3, 's3')}
              <div style={{ marginBottom: 16 }} />
              {renderSplitRows(sec4, 's4')}
            </div>
          </div>

          <p
            className={revealClass(gridReveal.visible)}
            style={{ ...staggerDelay(3), fontFamily: MONO, fontSize: 11, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#aaa', textAlign: 'center', marginTop: 18 }}
          >
            유닛 위에 마우스를 올리면 상세 정보를 확인할 수 있습니다
          </p>
        </div>
      </section>

      {/* ── Features — Lime color block ── */}
      <section style={{ backgroundColor: CANVAS, padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div ref={featuresReveal.ref} style={{ backgroundColor: LIME, borderRadius: 24, padding: '56px 48px' }}>
            <div className={revealClass(featuresReveal.visible)} style={{ ...staggerDelay(0), textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.54px', textTransform: 'uppercase', color: '#5a6e40', marginBottom: 16 }}>
                Why Nemonemo
              </p>
              <h2 style={{ fontFamily: FONT, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.96px' }}>
                네모네모를 선택하는 이유
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={revealClass(featuresReveal.visible)}
                  style={{ ...staggerDelay(i + 1), backgroundColor: CANVAS, borderRadius: 16, padding: 28 }}
                >
                  <div style={{ color: ORANGE, marginBottom: 18 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.2px', marginBottom: 10 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, lineHeight: 1.6, letterSpacing: '-0.1px', color: '#555' }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Size Guide ── */}
      <section style={{ backgroundColor: CANVAS, padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div ref={sizesReveal.ref} style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className={revealClass(sizesReveal.visible)} style={{ ...staggerDelay(0), fontFamily: MONO, fontSize: 11, letterSpacing: '0.54px', textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>
              Unit Sizes
            </p>
            <h2
              className={revealClass(sizesReveal.visible)}
              style={{ ...staggerDelay(1), fontFamily: FONT, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 300, letterSpacing: '-0.96px', lineHeight: 1.1, marginBottom: 16 }}
            >
              유닛 사이즈 안내
            </h2>
            <p className={revealClass(sizesReveal.visible)} style={{ ...staggerDelay(2), fontFamily: FONT, fontSize: 17, fontWeight: 300, color: '#666', letterSpacing: '-0.14px' }}>
              필요한 크기에 딱 맞는 보관 공간을 선택하세요.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {Object.keys(SIZE_LABEL).map((size, i) => (
              <div
                key={size}
                className={revealClass(sizesReveal.visible)}
                style={{
                  ...staggerDelay(i + 3),
                  borderRadius: 24,
                  border: `1px solid ${HAIR}`,
                  padding: '28px 24px',
                  textAlign: 'center',
                  backgroundColor: CANVAS,
                }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 52, height: 52, borderRadius: 12,
                  backgroundColor: INK, color: CANVAS,
                  fontFamily: FONT, fontSize: 18, fontWeight: 700,
                  marginBottom: 18,
                }}>
                  {size}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, letterSpacing: '-0.2px', marginBottom: 4 }}>{SIZE_LABEL[size]}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#999', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 20 }}>{SIZE_DIMS[size]}</div>
                <div style={{ borderTop: `1px solid ${HAIR}`, paddingTop: 20 }}>
                  <div style={{ fontFamily: FONT, fontSize: 19, fontWeight: 600, letterSpacing: '-0.3px', marginBottom: 6, color: ORANGE }}>
                    월 {SIZE_PRICE[size].toLocaleString()}원~
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 300, color: '#777', marginBottom: 10 }}>{SIZE_EXAMPLE[size]}</div>
                  {SIZE_COUNT[size] && (
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.4px', textTransform: 'uppercase', backgroundColor: SURF, padding: '4px 12px', borderRadius: 9999, color: '#666' }}>
                      총 {SIZE_COUNT[size]}개
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotion — Coral color block ── */}
      <section style={{ backgroundColor: CANVAS, padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div ref={promoReveal.ref} style={{ backgroundColor: CORAL, borderRadius: 24, padding: '56px 48px' }}>
            <div className={revealClass(promoReveal.visible)} style={{ ...staggerDelay(0), textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.54px', textTransform: 'uppercase', color: '#7a5244', marginBottom: 16 }}>
                Long-term Discount
              </p>
              <h2 style={{ fontFamily: FONT, fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 300, letterSpacing: '-0.96px', lineHeight: 1.1, marginBottom: 14 }}>
                장기 계약 특별 할인
              </h2>
              <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 300, letterSpacing: '-0.14px' }}>
                계약 기간이 길수록 더 큰 혜택을 드립니다.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {PROMOTIONS.map((p, i) => (
                <div
                  key={p.months}
                  className={revealClass(promoReveal.visible)}
                  style={{ ...staggerDelay(i + 1), backgroundColor: CANVAS, borderRadius: 24, padding: '32px 28px', textAlign: 'center', position: 'relative' }}
                >
                  {p.badge && (
                    <span style={{
                      fontFamily: MONO, fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase',
                      position: 'absolute', top: 16, right: 16,
                      backgroundColor: INK, color: CANVAS,
                      padding: '4px 10px', borderRadius: 9999,
                    }}>
                      {p.badge}
                    </span>
                  )}
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', backgroundColor: SURF, display: 'inline-block', padding: '5px 14px', borderRadius: 9999, marginBottom: 24, color: '#666' }}>
                    {p.months}개월 계약
                  </div>
                  <div style={{ marginBottom: 6, lineHeight: 1 }}>
                    <span style={{ fontFamily: FONT, fontSize: 64, fontWeight: 300, letterSpacing: '-2px', color: ORANGE }}>{p.discount}</span>
                    <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 300, color: '#aaa' }}>%</span>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 24 }}>월 요금 할인</div>
                  <div style={{ borderTop: `1px solid ${HAIR}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {p.benefits.map(item => (
                      <div key={item} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#555' }}>
                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15, color: '#1ea64a', flexShrink: 0 }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                  <button
                    className="pill-primary"
                    onClick={() => navigate('/inquiry')}
                    style={{ marginTop: 24, width: '100%', fontFamily: FONT, fontSize: 15, fontWeight: 500, letterSpacing: '-0.1px', backgroundColor: ORANGE, color: CANVAS, borderRadius: 9999, padding: '11px 0', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  >
                    문의하기
                  </button>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center', marginTop: 24, color: '#7a5244' }}>
              * 할인은 월 기본 요금 기준이며, 계약 시작일로부터 적용됩니다. 중도 해지 시 정상 요금과의 차액을 공제 후 환불됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA — Navy color block ── */}
      <section style={{ backgroundColor: CANVAS, padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div ref={ctaReveal.ref} style={{ backgroundColor: NAVY, borderRadius: 24, padding: '80px 48px', textAlign: 'center' }}>
            <h2
              className={revealClass(ctaReveal.visible)}
              style={{
                ...staggerDelay(0),
                fontFamily: FONT,
                fontSize: 'clamp(30px, 4vw, 52px)',
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.96px',
                color: CANVAS,
                marginBottom: 20,
              }}
            >
              지금 바로 빈 유닛을<br />예약하세요
            </h2>
            <p
              className={revealClass(ctaReveal.visible)}
              style={{ ...staggerDelay(1), fontFamily: FONT, fontSize: 17, fontWeight: 300, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', marginBottom: 44 }}
            >
              원하는 사이즈와 입고 희망일을 알려주시면<br />빠르게 확인 후 연락드립니다.
            </p>
            <div className={revealClass(ctaReveal.visible)} style={{ ...staggerDelay(2), display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="pill-primary"
                onClick={() => navigate('/inquiry')}
                style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, letterSpacing: '-0.1px', backgroundColor: CANVAS, color: INK, borderRadius: 9999, padding: '11px 28px', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
              >
                예약 문의하기
              </button>
              <button
                className="pill-ghost"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, letterSpacing: '-0.1px', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)', borderRadius: 9999, padding: '11px 28px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'border-color 0.15s' }}
              >
                맨 위로
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: CANVAS, borderTop: `1px solid ${HAIR}`, padding: '64px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: ORANGE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: CANVAS, flexShrink: 0 }}>N</span>
            <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, letterSpacing: '-0.44px' }}>네모네모 스토리지</span>
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#aaa', textAlign: 'center' }}>
            © 2026 네모네모 스토리지 &nbsp;·&nbsp; 서울 강남구 &nbsp;·&nbsp; 문의: 02-0000-0000
          </p>
        </div>
      </footer>

      {/* ── Tooltip ── */}
      {hovered && (
        <div
          style={{
            position: 'fixed',
            zIndex: 50,
            pointerEvents: 'none',
            left: mousePos.x + 16,
            top: mousePos.y + 16,
            backgroundColor: NAVY,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 18px',
            fontFamily: FONT,
            fontSize: 13,
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.85)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            maxWidth: 220,
          }}
        >
          <strong style={{ color: CANVAS, fontWeight: 600 }}>{hovered.unitNumber}</strong>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}> · </span>
          {SIZE_LABEL[hovered.size]} ({hovered.size})
          <br />
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            {SIZE_DIMS[hovered.size]}
          </span>
          <br />
          <span style={{ fontWeight: 600, color: CANVAS }}>월 {SIZE_PRICE[hovered.size].toLocaleString()}원</span>
          <br />
          <span
            style={{
              ...statusBadgeStyle(hovered),
              display: 'inline-block',
              padding: '3px 9px',
              borderRadius: 9999,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.4px',
              fontWeight: 700,
              marginTop: 6,
              color: INK,
            }}
          >
            {unitStatusLabel(hovered)}
          </span>
        </div>
      )}
    </div>
  )
}
