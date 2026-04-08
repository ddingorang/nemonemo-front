// Created: 2026-04-08 23:13:35
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">네모네모<br /><span>관리자</span></div>
        <nav>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>대시보드</NavLink>
          <NavLink to="/admin/units" className={({ isActive }) => isActive ? 'active' : ''}>유닛 관리</NavLink>
          <NavLink to="/admin/inquiries" className={({ isActive }) => isActive ? 'active' : ''}>문의 관리</NavLink>
          <NavLink to="/admin/contracts" className={({ isActive }) => isActive ? 'active' : ''}>계약 관리</NavLink>
        </nav>
        <button className="logout-btn" onClick={logout}>로그아웃</button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
