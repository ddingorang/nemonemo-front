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
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">네모네모</div>
        <p className="login-sub">관리자 로그인</p>
        <form onSubmit={submit}>
          <input
            required
            placeholder="아이디"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          />
          <input
            required
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary full">로그인</button>
        </form>
      </div>
    </div>
  )
}
