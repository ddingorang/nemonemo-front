// Created: 2026-04-08 23:14:16
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client.js'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-13 rounded-[20px] w-full max-w-[380px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_36px_rgba(37,99,235,0.1)] border border-blue-600/10">
        <div className="text-[30px] font-extrabold text-blue-600 text-center mb-1.5 tracking-tighter">네모네모</div>
        <p className="text-center text-slate-400 mb-8 text-[13px]">관리자 로그인</p>
        <form onSubmit={submit}>
          <input
            required
            className="block w-full p-2.5 px-3.5 border-[1.5px] border-slate-200 rounded-lg mb-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50"
            placeholder="아이디"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />
          <input
            required
            type="password"
            className="block w-full p-2.5 px-3.5 border-[1.5px] border-slate-200 rounded-lg mb-3 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50"
            placeholder="비밀번호"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
          {error && <p className="text-red-600 text-[13px] mb-3.5 p-2.5 px-3.5 bg-red-50 rounded-lg border border-red-200">{error}</p>}
          <button type="submit" className="btn-primary w-full p-[13px] text-[15px]">로그인</button>
        </form>
      </div>
    </div>
  )
}
