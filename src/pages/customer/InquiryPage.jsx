// Created: 2026-04-08 23:14:12
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

const SIZES = ['S', 'M', 'L', 'XL']

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
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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
    try {
      const payload = {
        ...form,
        unitId: form.unitId ? Number(form.unitId) : null,
        desiredDurationMonths: Number(form.desiredDurationMonths),
      }
      await client.post('/inquiries', payload)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || '제출 중 오류가 발생했습니다.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center px-4 py-13">
        <div className="text-center bg-white rounded-[20px] p-12 w-full max-w-[600px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_28px_rgba(0,0,0,0.08)]">
          <div className="w-[72px] h-[72px] bg-green-100 rounded-full flex items-center justify-center text-[30px] text-green-600 mx-auto mb-6">✓</div>
          <h2 className="text-2xl font-extrabold mb-3 tracking-tight">문의가 접수되었습니다</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">담당자가 영업일 기준 1~2일 내로 연락드립니다.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>메인으로</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-start px-4 py-13">
      <div className="bg-white rounded-[20px] p-12 w-full max-w-[600px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_28px_rgba(0,0,0,0.08)]">
        <button className="bg-none text-slate-400 text-[13px] p-0 mb-7 inline-flex items-center gap-1.5 transition-colors hover:text-slate-900" onClick={() => navigate('/')}>← 돌아가기</button>
        <h1 className="text-[26px] font-extrabold mb-2 tracking-tight">예약 문의</h1>
        <p className="text-slate-500 mb-9 leading-relaxed">원하시는 유닛 또는 사이즈를 선택하고 문의를 남겨주세요.</p>

        <form onSubmit={submit}>
          <fieldset className="border-none mb-10">
            <legend className="font-bold text-[11px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6 w-full">공간 선택</legend>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-semibold text-slate-700">특정 유닛 선택 <span className="font-normal text-slate-400">(선택)</span></label>
              <select 
                className="border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900"
                value={form.unitId} 
                onChange={(e) => set('unitId', e.target.value)}
              >
                <option value="">사이즈로만 문의하기</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber} ({u.size}, {u.areaSqm}㎡)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-semibold text-slate-700">희망 사이즈</label>
              <div className="flex gap-2.5 flex-wrap">
                {SIZES.map((s) => (
                  <label 
                    key={s} 
                    className={`flex items-center gap-2 px-5 py-2.5 border-[1.5px] rounded-xl cursor-pointer transition-all font-medium ${
                      form.desiredSize === s 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold shadow-[0_0_0_2px_rgba(37,99,235,0.12)]' 
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <input type="radio" className="hidden" name="size" value={s} checked={form.desiredSize === s} onChange={() => set('desiredSize', s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="border-none mb-10">
            <legend className="font-bold text-[11px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6 w-full">고객 정보</legend>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-semibold text-slate-700">이름 *</label>
              <input 
                required 
                className="border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900"
                value={form.customerName} 
                onChange={(e) => set('customerName', e.target.value)} 
                placeholder="홍길동" 
              />
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-semibold text-slate-700">연락처 *</label>
              <input 
                required 
                className="border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900"
                value={form.customerPhone} 
                onChange={(e) => set('customerPhone', e.target.value)} 
                placeholder="010-0000-0000" 
              />
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-semibold text-slate-700">이메일 <span className="font-normal text-slate-400">(선택)</span></label>
              <input 
                type="email" 
                className="border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900"
                value={form.customerEmail} 
                onChange={(e) => set('customerEmail', e.target.value)} 
                placeholder="example@email.com" 
              />
            </div>
          </fieldset>

          <fieldset className="border-none mb-10">
            <legend className="font-bold text-[11px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-6 w-full">이용 정보</legend>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-semibold text-slate-700">희망 시작일 *</label>
              <input 
                required 
                type="date" 
                className="border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900"
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
                  max={60}
                  className="w-24 border-[1.5px] border-slate-200 rounded-lg p-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900"
                  value={form.desiredDurationMonths}
                  onChange={(e) => set('desiredDurationMonths', e.target.value)}
                />
                <span className="text-[14px] text-slate-600 font-medium">개월</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-8">
              <label className="text-[13px] font-semibold text-slate-700">문의 내용 <span className="font-normal text-slate-400">(선택)</span></label>
              <textarea 
                rows={5} 
                className="border-[1.5px] border-slate-200 rounded-lg p-3.5 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50 text-slate-900 resize-none"
                value={form.message} 
                onChange={(e) => set('message', e.target.value)} 
                placeholder="추가로 문의하실 내용을 적어주세요." 
              />
            </div>
          </fieldset>

          {error && <p className="text-red-600 text-[13px] mb-3.5 p-3.5 bg-red-50 rounded-lg border border-red-200">{error}</p>}
          <button type="submit" className="btn-primary w-full p-[13px] text-[15px]">문의 제출</button>
        </form>
      </div>
    </div>
  )
}
