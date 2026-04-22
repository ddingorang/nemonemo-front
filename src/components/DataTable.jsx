// Created: 2026-04-08 23:14:37
import { useState } from 'react'

export default function DataTable({ columns, rows, onEdit, onDelete, actions, serverPage, serverTotalPages, serverTotalCount, onServerPageChange, headerExtra, selectedId, onSelect, rowClass }) {
  const isServerPaged = serverPage !== undefined

  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    if (!isServerPaged) setPage(1)
  }

  const filtered = rows.filter((row) =>
    columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())),
  )

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const va = a[sortKey]; const vb = b[sortKey]
        if (va == null && vb == null) return 0
        if (va == null) return 1
        if (vb == null) return -1
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      })
    : filtered

  const activePage = isServerPaged ? serverPage : page
  const totalPages = isServerPaged ? (serverTotalPages ?? 1) : Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paged = isServerPaged ? sorted : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goPage(p) {
    if (isServerPaged) onServerPageChange?.(p)
    else setPage(p)
  }

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-3.5 px-5 border-b border-slate-100 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            className="p-2 px-3.5 border-[1.5px] border-slate-200 rounded-lg w-[240px] outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 bg-slate-50"
            placeholder="검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (!isServerPaged) setPage(1) }}
          />
          {headerExtra}
        </div>
        <span className="text-[13px] text-slate-400">총 {isServerPaged ? (serverTotalCount ?? rows.length) : filtered.length}건</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <colgroup>
            {onSelect && <col style={{ width: '40px' }} />}
            {columns.map((col) => <col key={col.key} style={col.width ? { width: col.width } : {}} />)}
            {(onEdit || onDelete || actions) && <col style={{ width: '120px' }} />}
          </colgroup>
          <thead>
            <tr>
              {onSelect && <th className="w-10 p-2.5 px-4 bg-slate-50/50 border-b border-slate-200" />}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={`text-center p-2.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-50/50 border-b border-slate-200 whitespace-nowrap tracking-wider uppercase ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-orange-50 hover:text-orange-500' : ''}`}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
              {(onEdit || onDelete || actions) && <th className="text-center p-2.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-50/50 border-b border-slate-200 whitespace-nowrap tracking-wider uppercase">작업</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (onSelect ? 2 : 1)} className="text-center text-slate-400 p-16">데이터가 없습니다.</td></tr>
            ) : paged.map((row, i) => (
              <tr key={row.id ?? i} className={`transition-colors ${onSelect && row.id === selectedId ? 'bg-orange-50/60' : rowClass?.(row) ? '' : 'hover:bg-slate-50/80'} ${rowClass ? rowClass(row) : ''}`}>
                {onSelect && (
                  <td className="p-2.5 px-4 border-b border-slate-100 w-10">
                    <div className="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-orange-500 cursor-pointer block"
                        checked={row.id === selectedId}
                        onChange={() => onSelect(row.id === selectedId ? null : row)}
                      />
                    </div>
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={`p-2.5 px-4 border-b border-slate-100 align-middle text-slate-700 font-medium text-center ${col.wrap ? '' : 'whitespace-nowrap'} ${col.cellClass ? col.cellClass(row[col.key], row) : ''}`}>{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}</td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="p-2.5 px-4 border-b border-slate-100 align-middle whitespace-nowrap text-center">
                    <div className="flex gap-2 justify-center">
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
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-orange-500 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={activePage === 1} onClick={() => goPage(1)}>«</button>
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-orange-500 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={activePage === 1} onClick={() => goPage(activePage - 1)}>‹</button>
          <span className="text-[13px] text-slate-500 px-1.5">{activePage} / {totalPages}</span>
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-orange-500 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={activePage === totalPages} onClick={() => goPage(activePage + 1)}>›</button>
          <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-[13px] font-semibold transition-all hover:bg-orange-500 hover:text-white disabled:opacity-35 disabled:cursor-default" disabled={activePage === totalPages} onClick={() => goPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  )
}
