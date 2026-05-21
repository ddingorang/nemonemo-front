// Updated: 2026-05-14
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

// Design tokens (DESIGN.md)
const FONT = "'Inter', 'SF Pro Display', system-ui, helvetica, sans-serif"
const MONO = "'JetBrains Mono', 'SF Mono', menlo, monospace"
const LIME  = '#dceeb1'
const INK   = '#000000'
const CANVAS = '#ffffff'
const HAIR   = '#e6e6e6'
const SURF   = '#f7f7f5'
const ORANGE = '#f97316'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SIZE_COLOR = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }

const FIELD_CLASS =
  'w-full px-[12px] py-[8px] border border-[#e6e6e6] rounded-[8px] bg-white text-black outline-none transition-all duration-200 focus:border-black focus:ring-4 focus:ring-black/5 placeholder:text-[#999] text-[14px]'

export default function InquiryPage() {
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [form, setForm] = useState({
    unitId: '',
    desiredSize: 'S',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    desiredStartDate: '',
    desiredDurationMonths: 1,
    message: '',
  })
  const [durationUnit, setDurationUnit] = useState('month')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    client.get('/units').then((res) => {
      setUnits(res.data.filter((u) => u.status === 'AVAILABLE'))
    })
  }, [])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const months = durationUnit === 'week'
        ? Math.ceil(Number(form.desiredDurationMonths) / 4)
        : Number(form.desiredDurationMonths)
      const payload = {
        ...form,
        unitId: form.unitId ? Number(form.unitId) : null,
        desiredDurationMonths: Math.max(1, months),
      }
      await client.post('/inquiries', payload)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || '제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex justify-center items-center px-4 py-12 bg-white" style={{ fontFamily: FONT }}>
        <div className="text-center bg-[#dceeb1] rounded-[24px] p-[40px] w-full max-w-[500px]">
          <div className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center text-[24px] mx-auto mb-5">✓</div>
          <h2 className="text-[32px] font-[340] tracking-[-0.64px] leading-[1.1] mb-3">문의가 접수되었습니다</h2>
          <p className="text-black/60 text-[16px] font-[330] leading-[1.4] mb-7">담당자가 영업일 기준 1~2일 내로 연락드립니다.</p>
          <button
            className="px-[24px] py-[10px] rounded-full font-[480] text-white bg-black text-[16px] transition-all hover:opacity-80"
            onClick={() => navigate('/')}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: FONT, color: INK }}>
      
      {/* Top Nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#e6e6e6] h-[52px]">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <button className="flex items-center gap-2" onClick={() => navigate('/')}>
            <span className="w-[24px] h-[24px] rounded-[6px] bg-[#f97316] flex items-center justify-center text-white font-bold text-[11px]">N</span>
            <span className="font-bold text-[16px] tracking-[-0.3px]">네모네모 스토리지</span>
          </button>
          <button 
            className="px-[16px] py-[6px] rounded-full border border-[#e6e6e6] text-[13px] font-[500] hover:bg-[#f7f7f5] transition-colors"
            onClick={() => navigate('/')}
          >
            돌아가기
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-[40px] px-4 md:px-6">
        <div className="max-w-[1000px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px]">
            
            {/* Left Column: Intro */}
            <div className="lg:col-span-5 flex flex-col justify-start pt-4">
              <span style={{ fontFamily: MONO }} className="text-[12px] tracking-[0.5px] uppercase text-black/40 mb-4">Reservation</span>
              <h1 className="text-[44px] md:text-[56px] font-[340] leading-[1.05] tracking-[-1.12px] mb-6">
                나만의 창고,<br />문의하기
              </h1>
              <p className="text-[17px] font-[330] leading-[1.5] text-black/60 max-w-[340px]">
                원하시는 유닛 또는 사이즈를 선택하고 문의를 남겨주세요. 빠르게 확인 후 연락드리겠습니다.
              </p>
            </div>

            {/* Right Column: Form on Lime Block */}
            <div className="lg:col-span-7">
              <div className="bg-[#dceeb1] rounded-[24px] p-[24px] md:p-[32px]">
                <form onSubmit={submit} className="space-y-[24px]">
                  
                  {/* Space Section */}
                  <section>
                    <label style={{ fontFamily: MONO }} className="block text-[10px] tracking-[0.5px] uppercase text-black/40 mb-3">Space Selection</label>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[15px] font-[480]">희망 사이즈</span>
                        <div className="flex flex-wrap gap-1.5">
                          {SIZES.map((s) => {
                            const active = form.desiredSize === s
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => set('desiredSize', s)}
                                className={`px-[16px] py-[6px] rounded-full text-[13px] font-[480] transition-all ${
                                  active ? 'text-white' : 'bg-white text-black border border-transparent hover:border-[#e6e6e6]'
                                }`}
                                style={active ? { backgroundColor: SIZE_COLOR[s] } : {}}
                              >
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[15px] font-[480]">특정 유닛 <span className="text-black/30 font-[320]">(선택)</span></span>
                        <select
                          className={FIELD_CLASS}
                          value={form.unitId}
                          onChange={(e) => set('unitId', e.target.value)}
                        >
                          <option value="">사이즈로만 문의하기</option>
                          {units
                            .filter((u) => u.size === form.desiredSize)
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.unitNumber} ({u.size})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Customer Section */}
                  <section>
                    <label style={{ fontFamily: MONO }} className="block text-[10px] tracking-[0.5px] uppercase text-black/40 mb-3">Customer Info</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[15px] font-[480]">이름 *</span>
                        <input
                          required
                          type="text"
                          className={FIELD_CLASS}
                          value={form.customerName}
                          onChange={(e) => set('customerName', e.target.value)}
                          placeholder="홍길동"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[15px] font-[480]">연락처 *</span>
                        <input
                          required
                          type="text"
                          className={FIELD_CLASS}
                          value={form.customerPhone}
                          onChange={(e) => set('customerPhone', e.target.value)}
                          placeholder="010-0000-0000"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <span className="text-[15px] font-[480]">이메일 <span className="text-black/30 font-[320]">(선택)</span></span>
                        <input
                          type="email"
                          className={FIELD_CLASS}
                          value={form.customerEmail}
                          onChange={(e) => set('customerEmail', e.target.value)}
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Usage Section */}
                  <section>
                    <label style={{ fontFamily: MONO }} className="block text-[10px] tracking-[0.5px] uppercase text-black/40 mb-3">Usage Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[15px] font-[480]">희망 시작일 *</span>
                        <input
                          required
                          type="date"
                          className={FIELD_CLASS}
                          value={form.desiredStartDate}
                          onChange={(e) => set('desiredStartDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[15px] font-[480]">이용 기간 *</span>
                        <div className="flex gap-1.5">
                          <input
                            required
                            type="number"
                            min={1}
                            className={`${FIELD_CLASS} flex-1`}
                            value={form.desiredDurationMonths}
                            onChange={(e) => set('desiredDurationMonths', e.target.value)}
                          />
                          <div className="flex bg-white rounded-[8px] border border-[#e6e6e6] p-0.5">
                            {['month', 'week'].map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => { setDurationUnit(u); set('desiredDurationMonths', 1) }}
                                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-[500] transition-all ${
                                  durationUnit === u ? 'text-white' : 'text-black hover:bg-[#f7f7f5]'
                                }`}
                                style={durationUnit === u ? { backgroundColor: ORANGE } : {}}
                              >
                                {u === 'month' ? '개월' : '주'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <span className="text-[15px] font-[480]">문의 내용 <span className="text-black/30 font-[320]">(선택)</span></span>
                        <textarea
                          rows={3}
                          className={`${FIELD_CLASS} resize-none`}
                          value={form.message}
                          onChange={(e) => set('message', e.target.value)}
                          placeholder="추가로 궁금하신 점이 있다면 적어주세요."
                        />
                      </div>
                    </div>
                  </section>

                  {/* Error & Submit */}
                  <div className="pt-2">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-[8px] mb-3 text-[12px] border border-red-100">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-[12px] rounded-full text-white font-[480] text-[16px] transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: ORANGE }}
                    >
                      {loading ? '제출 중...' : '문의 제출하기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-[40px] border-t border-[#e6e6e6]">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <p style={{ fontFamily: MONO }} className="text-[11px] tracking-[0.5px] uppercase text-black/30">
            © 2026 NEMONEMO STORAGE · ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  )
}
