// Created: 2026-04-08 23:14:27
import { useEffect, useState } from 'react'
import client from '../../api/client.js'

export default function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    client.get('/admin/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="p-12 text-center text-slate-400">불러오는 중...</div>

  const { unitSummary: s, expiringThisMonth, pendingInquiryCount } = data

  return (
    <div className="p-12 px-14 max-w-[1440px]">
      <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 mb-8">대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 px-7 border-[1.5px] border-slate-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">전체 유닛</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-slate-900">{s.total}</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 px-7 border-[1.5px] border-green-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-green-600/60 uppercase tracking-widest mb-3">이용 가능</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-green-600">{s.available}</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-6 px-7 border-[1.5px] border-orange-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-orange-600/60 uppercase tracking-widest mb-3">사용 중</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-orange-600">{s.occupied}</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 px-7 border-[1.5px] border-slate-300 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">점검 중</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-slate-500">{s.maintenance}</div>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-6 px-7 border-[1.5px] border-yellow-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="text-[11px] font-bold text-yellow-600/60 uppercase tracking-widest mb-3">미처리 문의</div>
          <div className="text-[42px] font-extrabold tracking-tighter leading-none text-yellow-600">{pendingInquiryCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
          이번 달 만료 예정 계약 ({expiringThisMonth.length}건)
        </h2>
        {expiringThisMonth.length === 0 ? (
          <p className="text-slate-400 text-[13px] py-5">이번 달 만료 예정 계약이 없습니다.</p>
        ) : (
          <div className="bg-white rounded-2xl border-[1.5px] border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">유닛</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">고객명</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">연락처</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">종료일</th>
                  <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">계약 금액</th>
                </tr>
              </thead>
              <tbody>
                {expiringThisMonth.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 px-4 border-b border-slate-100">{c.unitNumber}</td>
                    <td className="p-3 px-4 border-b border-slate-100">{c.customerName}</td>
                    <td className="p-3 px-4 border-b border-slate-100">{c.customerPhone}</td>
                    <td className="p-3 px-4 border-b border-slate-100 text-yellow-600 font-semibold">{c.endDate}</td>
                    <td className="p-3 px-4 border-b border-slate-100">{Number(c.totalPrice).toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
