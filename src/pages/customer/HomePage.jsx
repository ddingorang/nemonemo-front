// Created: 2026-04-09 23:36:28
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

const SIZE_ORDER = { S: 0, M: 1, L: 2, XL: 3 }
const SIZE_LABEL = { S: '소형', M: '중형', L: '대형', XL: '특대형' }

function unitColor(unit) {
  if (unit.status === 'AVAILABLE') return 'cell-available'
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return 'cell-expiring'
  if (unit.status === 'OCCUPIED') return 'cell-occupied'
  if (unit.status === 'RESERVED') return 'cell-reserved'
  return 'cell-maintenance'
}

function unitColorLabel(unit) {
  if (unit.status === 'AVAILABLE') return '이용 가능'
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return '만료 임박 (7일 이내)'
  if (unit.status === 'OCCUPIED') return '사용 중'
  if (unit.status === 'RESERVED') return '예약됨'
  return '점검 중'
}

export default function HomePage() {
  const [units, setUnits] = useState([])
  const [hovered, setHovered] = useState(null)
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
    <div className="home-wrap">
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo">네모네모 스토리지</div>
          <button className="btn-outline" onClick={() => navigate('/admin/login')}>관리자</button>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-badge">강남 1호점 · 24시간 보안</div>
          <h1>당신의 소중한 물건,<br />네모네모가 안전하게<br />보관합니다</h1>
          <p>S / M / L / XL 총 50개 유닛 운영 중<br />지금 바로 원하는 공간을 확인하세요.</p>
          <button className="btn-primary" onClick={() => navigate('/inquiry')}>예약 문의하기</button>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-inner">
          <div className="section-header">
            <h2>창고 현황</h2>
            <div className="legend">
              <span className="legend-item"><span className="legend-dot cell-available" />이용 가능 ({stats.available})</span>
              <span className="legend-item"><span className="legend-dot cell-occupied" />사용 중 ({stats.occupied})</span>
              <span className="legend-item"><span className="legend-dot cell-expiring" />만료 임박 ({stats.expiring})</span>
            </div>
          </div>

          <div className="unit-grid-wrap">
            <div className="unit-grid">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`unit-cell ${unitColor(unit)}`}
                  onMouseEnter={() => setHovered(unit)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="cell-size">{unit.size}</span>
                  <span className="cell-number">{unit.unitNumber}</span>
                </div>
              ))}
            </div>
          </div>

          {hovered && (
            <div className="unit-tooltip">
              <strong>{hovered.unitNumber}</strong> · {SIZE_LABEL[hovered.size]} ({hovered.size})
              <br />
              면적 {hovered.areaSqm}㎡ · 월 {Number(hovered.monthlyPrice).toLocaleString()}원
              <br />
              <span className={`status-badge ${unitColor(hovered)}`}>{unitColorLabel(hovered)}</span>
            </div>
          )}
        </div>
      </section>

      <section className="home-section size-guide">
        <div className="home-section-inner">
          <div className="section-header">
            <h2>유닛 사이즈 안내</h2>
          </div>
          <div className="size-cards">
            {[
              { size: 'S', desc: '소형', sqm: '3㎡', price: '50,000', count: 25, example: '짐 박스 10~15개' },
              { size: 'M', desc: '중형', sqm: '6㎡', price: '90,000', count: 10, example: '원룸 이사짐' },
              { size: 'L', desc: '대형', sqm: '12㎡', price: '160,000', count: 10, example: '투룸 이사짐' },
              { size: 'XL', desc: '특대형', sqm: '20㎡', price: '250,000', count: 5, example: '사무실 자재·비품' },
            ].map((s) => (
              <div key={s.size} className="size-card">
                <div className="size-badge">{s.size}</div>
                <div className="size-name">{s.desc}</div>
                <div className="size-sqm">{s.sqm}</div>
                <hr className="size-divider" />
                <div className="size-price">월 {s.price}원~</div>
                <div className="size-example">{s.example}</div>
                <div className="size-count">총 {s.count}개</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 네모네모 스토리지 · 서울 강남구 · 문의: 02-0000-0000</p>
      </footer>
    </div>
  )
}
