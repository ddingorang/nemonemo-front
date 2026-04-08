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
      <div className="inquiry-wrap">
        <div className="inquiry-success">
          <div className="success-icon">✓</div>
          <h2>문의가 접수되었습니다</h2>
          <p>담당자가 영업일 기준 1~2일 내로 연락드립니다.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>메인으로</button>
        </div>
      </div>
    )
  }

  return (
    <div className="inquiry-wrap">
      <div className="inquiry-card">
        <button className="back-btn" onClick={() => navigate('/')}>← 돌아가기</button>
        <h1>예약 문의</h1>
        <p className="inquiry-sub">원하시는 유닛 또는 사이즈를 선택하고 문의를 남겨주세요.</p>

        <form onSubmit={submit} className="inquiry-form">
          <fieldset>
            <legend>공간 선택</legend>
            <div className="form-row">
              <label>특정 유닛 선택 <span className="optional">(선택)</span></label>
              <select value={form.unitId} onChange={(e) => set('unitId', e.target.value)}>
                <option value="">사이즈로만 문의하기</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber} ({u.size}, {u.areaSqm}㎡)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>희망 사이즈</label>
              <div className="radio-group">
                {SIZES.map((s) => (
                  <label key={s} className={`radio-label ${form.desiredSize === s ? 'selected' : ''}`}>
                    <input type="radio" name="size" value={s} checked={form.desiredSize === s} onChange={() => set('desiredSize', s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>고객 정보</legend>
            <div className="form-row">
              <label>이름 *</label>
              <input required value={form.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder="홍길동" />
            </div>
            <div className="form-row">
              <label>연락처 *</label>
              <input required value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder="010-0000-0000" />
            </div>
            <div className="form-row">
              <label>이메일 <span className="optional">(선택)</span></label>
              <input type="email" value={form.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} placeholder="example@email.com" />
            </div>
          </fieldset>

          <fieldset>
            <legend>이용 정보</legend>
            <div className="form-row">
              <label>희망 시작일 *</label>
              <input required type="date" value={form.desiredStartDate} onChange={(e) => set('desiredStartDate', e.target.value)} />
            </div>
            <div className="form-row">
              <label>이용 기간 *</label>
              <div className="duration-row">
                <input
                  required
                  type="number"
                  min={1}
                  max={60}
                  value={form.desiredDurationMonths}
                  onChange={(e) => set('desiredDurationMonths', e.target.value)}
                />
                <span>개월</span>
              </div>
            </div>
            <div className="form-row">
              <label>문의 내용 <span className="optional">(선택)</span></label>
              <textarea rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="추가로 문의하실 내용을 적어주세요." />
            </div>
          </fieldset>

          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary full">문의 제출</button>
        </form>
      </div>
    </div>
  )
}
