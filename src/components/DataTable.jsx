// Created: 2026-04-08 23:14:37
import { useState } from 'react'

export default function DataTable({ columns, rows, onEdit, onDelete, actions }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const filtered = rows.filter((row) =>
    columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())),
  )

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const va = a[sortKey] ?? ''; const vb = b[sortKey] ?? ''
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      })
    : filtered

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-3.5 px-5 border-b border-slate-100">
        <input
          className="p-2 px-3.5 border-[1.5px] border-slate-200 rounded-lg w-[280px] outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 bg-slate-50"
          placeholder="검색..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <span className="text-[13px] text-slate-400">총 {filtered.length}건</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={`text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-50/50 border-b border-slate-200 whitespace-nowrap tracking-wider uppercase ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-blue-50 hover:text-blue-600' : ''}`}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
              {(onEdit || onDelete || actions) && <th className="text-left p-2.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-50/50 border-b border-slate-200 whitespace-nowrap tracking-wider uppercase">작업</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="text-center text-slate-400 p-16">데이터가 없습니다.</td></tr>
            ) : paged.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="p-2.5 px-4 border-b border-slate-100 align-middle whitespace-nowrap text-slate-700 font-medium">{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}</td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="p-2.5 px-4 border-b border-slate-100 align-middle whitespace-nowrap">
                    <div className="flex gap-2">
                      {actions && actions(row)}
                      {onEdit && <button className="btn-sm btn-edit" onClick={() => onEdit(row)}>수정</button>}
                      {onDelete && <button className="btn-sm btn-delete" onClick={() => onDelete(row)}>삭제</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 p-3.5 border-t border-slate-100">
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-blue-600 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-blue-600 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          <span className="text-[13px] text-slate-500 px-1.5">{page} / {totalPages}</span>
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-blue-600 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-blue-600 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  )
}
