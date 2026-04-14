// Created: 2026-04-08 23:13:35
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const NAVY = '#1a2238'
const NAVY_DARK = '#111827'
const NAVY_BORDER = 'rgba(255,255,255,0.07)'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: '대시보드' },
  { to: '/admin/units', label: '유닛 관리' },
  { to: '/admin/inquiries', label: '문의 관리' },
  { to: '/admin/contracts', label: '계약 관리' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-[230px] flex flex-col shrink-0" style={{ backgroundColor: NAVY_DARK, borderRight: `1px solid ${NAVY_BORDER}` }}>
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 px-5 py-5 transition-opacity hover:opacity-80"
          style={{ borderBottom: `1px solid ${NAVY_BORDER}` }}
        >
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: '#f97316' }}>N</span>
          <div>
            <div className="text-white font-extrabold text-[15px] tracking-tight leading-none">네모네모</div>
            <div className="text-[11px] mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>관리자</div>
          </div>
        </NavLink>

        {/* Nav */}
        <nav className="flex flex-col p-3 flex-1 gap-0.5 mt-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'text-white font-bold'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => isActive
                ? { backgroundColor: '#f97316', color: '#fff' }
                : { color: 'rgba(255,255,255,0.45)' }
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          className="m-3 p-3 rounded-lg text-[13px] text-left transition-all font-medium"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          onClick={logout}
        >
          로그아웃
        </button>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}
