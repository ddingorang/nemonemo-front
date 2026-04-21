// Updated: 2026-04-21
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SIZE_COLOR = { XS: '#818cf8', S: '#4ade80', M: '#38bdf8', L: '#fb923c', XL: '#f43f5e' }

const NAVY      = '#1a2238'
const NAVY_DEEP = '#111827'

const FIELD_CLASS =
  'w-full px-3.5 py-3 border-[1.5px] border-slate-200 rounded-xl bg-slate-50 text-slate-900 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-[5px] focus:ring-orange-500/12 placeholder:text-slate-400'

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
      <div className="min-h-screen flex justify-center items-center px-4 py-20" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-center bg-white rounded-[20px] p-14 w-full max-w-[560px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="w-[72px] h-[72px] bg-green-100 rounded-full flex items-center justify-center text-[28px] text-green-600 mx-auto mb-6">✓</div>
          <h2 className="text-[24px] font-extrabold tracking-tight mb-3">문의가 접수되었습니다</h2>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-9">담당자가 영업일 기준 1~2일 내로 연락드립니다.</p>
          <button
            className="px-8 py-3.5 rounded-xl font-extrabold text-white text-[15px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: '#f97316', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
            onClick={() => navigate('/')}
          >
            메인으로
          </button>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10" style={{ backgroundColor: NAVY }}>
        <div className="max-w-[1160px] mx-auto px-8 h-[68px] flex items-center">
          <button
            className="flex items-center gap-2.5"
            onClick={() => navigate('/')}
          >
            <span className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: '#f97316' }}>N</span>
            <span className="text-white font-extrabold text-[17px] tracking-tight">네모네모 스토리지</span>
          </button>
        </div>
      </header>

      {/* Form Card */}
      <div className="flex justify-center items-start px-4 py-16 flex-1">
        <div className="bg-white rounded-[20px] p-12 w-full max-w-[600px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_28px_rgba(0,0,0,0.08)]">

          {/* Back */}
          <button
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-[13px] transition-colors mb-7"
            onClick={() => navigate('/')}
          >
            ← 돌아가기
          </button>

          <h1 className="text-[26px] font-extrabold tracking-tight mb-2">예약 문의</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-9">원하시는 유닛 또는 사이즈를 선택하고 문의를 남겨주세요.</p>

          <form onSubmit={submit}>

            {/* ── 공간 선택 ── */}
            <fieldset className="border-none mb-10">
              <legend className="w-full font-bold text-[13px] text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6">
                공간 선택
              </legend>

              {/* 희망 사이즈 */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-[13px] font-semibold text-slate-700">희망 사이즈</label>
                <div className="flex gap-2.5 flex-wrap">
                  {SIZES.map((s) => {
                    const active = form.desiredSize === s
                    return (
                      <label
                        key={s}
                        className="flex items-center gap-2 px-5 py-2.5 border-[1.5px] rounded-xl cursor-pointer transition-all font-semibold select-none"
                        style={active ? {
                          borderColor: SIZE_COLOR[s],
                          backgroundColor: SIZE_COLOR[s] + '18',
                          color: SIZE_COLOR[s],
                          boxShadow: `0 0 0 3px ${SIZE_COLOR[s]}20`,
                          fontWeight: 700,
                        } : {
                          borderColor: '#e2e8f0',
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                        }}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name="desiredSize"
                          value={s}
                          checked={active}
                          onChange={() => set('desiredSize', s)}
                        />
                        {s}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* 특정 유닛 선택 */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-700">
                  특정 유닛 선택 <span className="font-normal text-slate-400">(선택)</span>
                </label>
                <select
                  className={FIELD_CLASS}
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px', cursor: 'pointer', appearance: 'none' }}
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
            </fieldset>

            {/* ── 고객 정보 ── */}
            <fieldset className="border-none mb-10">
              <legend className="w-full font-bold text-[13px] text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6">
                고객 정보
              </legend>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-[13px] font-semibold text-slate-700">이름 *</label>
                <input
                  required
                  type="text"
                  className={FIELD_CLASS}
                  value={form.customerName}
                  onChange={(e) => set('customerName', e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-[13px] font-semibold text-slate-700">연락처 *</label>
                <input
                  required
                  type="text"
                  className={FIELD_CLASS}
                  value={form.customerPhone}
                  onChange={(e) => set('customerPhone', e.target.value)}
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-700">
                  이메일 <span className="font-normal text-slate-400">(선택)</span>
                </label>
                <input
                  type="email"
                  className={FIELD_CLASS}
                  value={form.customerEmail}
                  onChange={(e) => set('customerEmail', e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
            </fieldset>

            {/* ── 이용 정보 ── */}
            <fieldset className="border-none mb-10">
              <legend className="w-full font-bold text-[13px] text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6">
                이용 정보
              </legend>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-[13px] font-semibold text-slate-700">희망 시작일 *</label>
                <input
                  required
                  type="date"
                  className={FIELD_CLASS}
                  value={form.desiredStartDate}
                  onChange={(e) => set('desiredStartDate', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-[13px] font-semibold text-slate-700">이용 기간 *</label>
                <div className="flex items-center gap-3">
                  <input
                    required
                    type="number"
                    min={1}
                    max={durationUnit === 'week' ? 52 : 60}
                    className={`${FIELD_CLASS} w-24`}
                    value={form.desiredDurationMonths}
                    onChange={(e) => set('desiredDurationMonths', e.target.value)}
                  />
                  <div className="flex rounded-xl border-[1.5px] border-slate-200 overflow-hidden text-[13px] font-semibold">
                    {[{ value: 'month', label: '개월' }, { value: 'week', label: '주' }].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        className="px-4 py-2.5 transition-all"
                        style={durationUnit === value
                          ? { backgroundColor: '#f97316', color: '#fff' }
                          : { backgroundColor: '#f8fafc', color: '#64748b' }}
                        onClick={() => { setDurationUnit(value); set('desiredDurationMonths', 1) }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-700">
                  문의 내용 <span className="font-normal text-slate-400">(선택)</span>
                </label>
                <textarea
                  rows={5}
                  className={`${FIELD_CLASS} resize-none`}
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="추가로 문의하실 내용을 적어주세요."
                />
              </div>
            </fieldset>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-[13px] mb-4 p-3.5 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-white text-[15px] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ backgroundColor: '#f97316', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  제출 중...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  문의 제출
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
