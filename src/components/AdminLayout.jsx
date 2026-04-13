// Created: 2026-04-08 23:13:35
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-[230px] bg-slate-900 text-slate-400 flex flex-col shrink-0 border-r border-slate-800">
        <div className="text-[18px] font-extrabold text-white px-6 pt-6.5 pb-5.5 border-b border-slate-800 tracking-tight leading-[1.4]">
          네모네모<br /><span className="text-[11px] font-normal text-slate-600 block mt-[3px]">관리자</span>
        </div>
        <nav className="flex flex-col p-3.5 flex-1 gap-[3px]">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? 'text-white bg-blue-600 font-bold' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>대시보드</NavLink>
          <NavLink to="/admin/units" className={({ isActive }) => `px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? 'text-white bg-blue-600 font-bold' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>유닛 관리</NavLink>
          <NavLink to="/admin/inquiries" className={({ isActive }) => `px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? 'text-white bg-blue-600 font-bold' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>문의 관리</NavLink>
          <NavLink to="/admin/contracts" className={({ isActive }) => `px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? 'text-white bg-blue-600 font-bold' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>계약 관리</NavLink>
        </nav>
        <button className="m-3 p-3.5 rounded-lg bg-slate-800 text-slate-500 text-[13px] transition-all text-left hover:bg-slate-700 hover:text-slate-200" onClick={logout}>로그아웃</button>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}
