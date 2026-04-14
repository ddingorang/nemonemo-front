// Created: 2026-04-09 23:36:28
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

const SIZE_ORDER = { S: 0, M: 1, L: 2, XL: 3 }
const SIZE_LABEL = { S: '소형', M: '중형', L: '대형', XL: '특대형' }

function unitColor(unit) {
  if (unit.status === 'AVAILABLE') return 'bg-green-400'
  if (unit.status === 'OCCUPIED' && unit.expiringSoon) return 'bg-yellow-400'
  if (unit.status === 'OCCUPIED') return 'bg-orange-400'
  if (unit.status === 'RESERVED') return 'bg-orange-300'
  return 'bg-slate-300'
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
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1120px] mx-auto px-10 h-16 flex justify-between items-center">
          <div className="text-xl font-extrabold text-blue-600 tracking-tighter">네모네모 스토리지</div>
          <button className="btn-outline" onClick={() => navigate('/admin/login')}>관리자</button>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#0c1a3a] via-[#1e3a8a] to-[#2563eb] text-white py-24 px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_65%_40%,_rgba(99,102,241,0.25)_0%,_transparent_65%)]"></div>
        <div className="max-w-[680px] mx-auto relative">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/85 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-7">
            강남 1호점 · 24시간 보안
          </div>
          <h1 className="text-[44px] font-extrabold leading-[1.22] mb-4.5 tracking-tight">
            당신의 소중한 물건,<br />네모네모가 안전하게<br />보관합니다
          </h1>
          <p className="text-base opacity-70 mb-9.5 leading-relaxed">
            S / M / L / XL 총 50개 유닛 운영 중<br />지금 바로 원하는 공간을 확인하세요.
          </p>
          <button className="btn-primary" onClick={() => navigate('/inquiry')}>예약 문의하기</button>
        </div>
      </section>

      <section className="py-10 px-10">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex justify-between items-center mb-7 flex-wrap gap-3">
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">창고 현황</h2>
            <div className="flex items-center gap-4 text-[13px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-400 shrink-0" />
                이용 가능 ({stats.available})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-orange-400 shrink-0" />
                사용 중 ({stats.occupied})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-yellow-400 shrink-0" />
                만료 임박 ({stats.expiring})
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 md:p-7 border border-slate-200">
            <div className="grid grid-cols-10 gap-1.5">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-default transition-all duration-150 border-2 border-transparent hover:scale-110 hover:shadow-lg hover:z-10 hover:border-black/10 ${unitColor(unit)}`}
                  onMouseEnter={() => setHovered(unit)}
                  onMouseLeave={() => setHovered(null)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                >
                  <span className="text-[15px] font-extrabold text-black/50">{unit.size}</span>
                  <span className="text-[13px] text-black/40">{unit.unitNumber}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="py-24 px-10 bg-slate-50">
        <div className="max-w-[1120px] mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight mb-3">유닛 사이즈 안내</h2>
            <p className="text-slate-500">필요한 크기에 딱 맞는 보관 공간을 제안해 드립니다.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { size: 'S', desc: '소형', sqm: '3㎡', price: '50,000', count: 25, example: '짐 박스 10~15개' },
              { size: 'M', desc: '중형', sqm: '6㎡', price: '90,000', count: 10, example: '원룸 이사짐' },
              { size: 'L', desc: '대형', sqm: '12㎡', price: '160,000', count: 10, example: '투룸 이사짐' },
              { size: 'XL', desc: '특대형', sqm: '20㎡', price: '250,000', count: 5, example: '사무실 자재·비품' },
            ].map((s) => (
              <div key={s.size} className="bg-white rounded-3xl p-10 text-center border-[1.5px] border-slate-200 transition-all duration-200 hover:border-blue-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="inline-flex items-center justify-center bg-blue-600 text-white text-[18px] font-extrabold w-[60px] h-[60px] rounded-2xl mb-5 tracking-tight shadow-lg shadow-blue-200">
                  {s.size}
                </div>
                <div className="font-bold text-lg mb-1 text-slate-900">{s.desc}</div>
                <div className="text-slate-400 text-sm mb-4">{s.sqm}</div>
                <hr className="border-none border-t border-slate-100 my-5" />
                <div className="text-blue-600 font-extrabold text-xl mb-3">월 {s.price}원~</div>
                <div className="text-slate-500 text-[13px] mb-1.5">{s.example}</div>
                <div className="text-slate-400 text-[12px] font-medium bg-slate-50 py-1 px-3 rounded-full inline-block">총 {s.count}개 유닛</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 px-10 text-center border-t border-slate-100 text-slate-400 text-[13px]">
        <p>© 2026 네모네모 스토리지 · 서울 강남구 · 문의: 02-0000-0000</p>
      </footer>

      {hovered && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900 text-slate-200 px-5 py-3.5 rounded-xl text-[13px] leading-relaxed border border-slate-800 shadow-xl"
          style={{ left: mousePos.x + 16, top: mousePos.y + 16 }}
        >
          <strong>{hovered.unitNumber}</strong> · {SIZE_LABEL[hovered.size]} ({hovered.size})
          <br />
          면적 {hovered.areaSqm}㎡ · 월 {Number(hovered.monthlyPrice).toLocaleString()}원
          <br />
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-1 text-black/70 ${unitColor(hovered)}`}>
            {unitColorLabel(hovered)}
          </span>
        </div>
      )}
    </div>
  )
}

