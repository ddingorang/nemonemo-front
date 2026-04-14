// Created: 2026-04-08 23:14:16
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

const NAVY = '#1a2238'
const NAVY_DEEP = '#111827'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await client.post('/admin/auth/login', form)
      localStorage.setItem('token', res.data.accessToken)
      navigate('/admin/dashboard')
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, #1e3a5f 100%)` }}
    >
      {/* 격자 패턴 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* 오렌지 글로우 */}
      <div
        className="absolute pointer-events-none opacity-10"
        style={{
          width: 500, height: 500,
          top: '-20%', right: '-10%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-[380px]">
        {/* 카드 */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        >
          {/* 오렌지 상단 바 */}
          <div className="h-1.5" style={{ backgroundColor: '#f97316' }} />

          <div className="p-10">
            {/* 로고 */}
            <div className="flex items-center justify-center gap-2.5 mb-8">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
                style={{ backgroundColor: '#f97316' }}
              >
                N
              </span>
              <div className="text-left">
                <div className="font-extrabold text-[18px] tracking-tight" style={{ color: NAVY_DEEP }}>네모네모</div>
                <div className="text-[11px] text-slate-400 font-medium">관리자 로그인</div>
              </div>
            </div>

            <form onSubmit={submit}>
              <input
                required
                className="block w-full p-3 px-3.5 border-[1.5px] border-slate-200 rounded-lg mb-3 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 bg-slate-50 text-[13px]"
                placeholder="아이디"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
              <input
                required
                type="password"
                className="block w-full p-3 px-3.5 border-[1.5px] border-slate-200 rounded-lg mb-4 outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 bg-slate-50 text-[13px]"
                placeholder="비밀번호"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
              {error && (
                <p className="text-red-600 text-[13px] mb-4 p-2.5 px-3.5 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full p-[13px] text-[15px]">
                로그인
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[12px] mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 네모네모 스토리지
        </p>
      </div>
    </div>
  )
}
