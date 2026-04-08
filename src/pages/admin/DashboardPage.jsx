// Created: 2026-04-08 23:14:27
import { useEffect, useState } from 'react'
import client from '../../api/client.js'

export default function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    client.get('/admin/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="page-loading">불러오는 중...</div>

  const { unitSummary: s, expiringThisMonth, pendingInquiryCount } = data

  return (
    <div className="admin-page">
      <h1 className="page-title">대시보드</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">전체 유닛</div>
          <div className="stat-value">{s.total}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">이용 가능</div>
          <div className="stat-value">{s.available}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">사용 중</div>
          <div className="stat-value">{s.occupied}</div>
        </div>
        <div className="stat-card gray">
          <div className="stat-label">점검 중</div>
          <div className="stat-value">{s.maintenance}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">미처리 문의</div>
          <div className="stat-value">{pendingInquiryCount}</div>
        </div>
      </div>

      <div className="dash-section">
        <h2>이번 달 만료 예정 계약 ({expiringThisMonth.length}건)</h2>
        {expiringThisMonth.length === 0 ? (
          <p className="empty-msg">이번 달 만료 예정 계약이 없습니다.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>유닛</th>
                <th>고객명</th>
                <th>연락처</th>
                <th>종료일</th>
                <th>월 임대료</th>
              </tr>
            </thead>
            <tbody>
              {expiringThisMonth.map((c) => (
                <tr key={c.id}>
                  <td>{c.unitNumber}</td>
                  <td>{c.customerName}</td>
                  <td>{c.customerPhone}</td>
                  <td className="text-yellow">{c.endDate}</td>
                  <td>{Number(c.monthlyPrice).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
