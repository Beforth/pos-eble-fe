import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  GroupedTable,
  type GroupedBlock,
  type GroupedColumn,
} from '../../components/reports/GroupedTable'
import {
  ColumnsMenu,
  LoadState,
  ReportCard,
  ReportFilterBar,
  ReportShell,
  SearchField,
  StatGrid,
  StatTile,
} from '../../components/reports/ReportShell'
import { TD, decimal, reportSubtitle } from '../../components/reports/reportStyles'
import { fetchReportApi, type ReportResult } from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

/** The numeric columns, in screen order. `key` matches the report row keys. */
const NUMERIC = [
  { key: 'qty', label: 'Qty.' },
  { key: 'my_amount', label: 'My Amount (₹)' },
  { key: 'discount', label: 'Total Discount (₹)' },
  { key: 'net', label: 'Net Amount (₹) (M.A - T.D)' },
  { key: 'tax', label: 'Total Tax (₹)' },
  { key: 'total', label: 'Total Sales (₹)' },
] as const

export default function GroupSummaryReport() {
  const { encryptedOutletId } = useAuth()
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, 'group-wise', { from, to })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        setError(err instanceof Error ? err.message : 'Could not load the report')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, from, to])

  const blocks = useMemo<GroupedBlock[]>(() => {
    const q = search.trim().toLowerCase()
    const byGroup = new Map<string, GroupedBlock>()
    for (const row of data?.rows ?? []) {
      const group = String(row.group)
      if (q && !String(row.item).toLowerCase().includes(q) && !group.toLowerCase().includes(q)) {
        continue
      }
      let block = byGroup.get(group)
      if (!block) {
        block = { name: group, rows: [], sums: {} }
        byGroup.set(group, block)
      }
      block.rows.push(row)
      for (const col of NUMERIC) {
        block.sums[col.key] = (block.sums[col.key] ?? 0) + (Number(row[col.key]) || 0)
      }
    }
    return [...byGroup.values()]
  }, [data, search])

  const columns: GroupedColumn[] = NUMERIC.filter((col) => !hidden.has(col.key)).map((col) => ({
    key: col.key,
    label: col.label,
  }))
  const totals = data?.totals ?? {}
  const roundOff = Number(totals.round_off) || 0
  const itemCount = blocks.reduce((sum, block) => sum + block.rows.length, 0)

  function toggleHidden(key: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleGroup(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function setRange(nextFrom: string, nextTo: string) {
    setFrom(nextFrom)
    setTo(nextTo)
  }

  function exportCsv() {
    if (blocks.length === 0) {
      showToast('Nothing to export')
      return
    }
    const keys = ['group', 'item', ...columns.map((col) => col.key)]
    const labels = ['Group', 'Item', ...columns.map((col) => col.label)]
    const body = blocks.flatMap((block) =>
      block.rows.map((row) => keys.map((key) => row[key] ?? '')),
    )
    downloadCsv(`group-report_${from}_${to}.csv`, labels, body)
  }

  return (
    <ReportShell
      title="Group Report"
      subtitle={reportSubtitle(
        from,
        to,
        data ? `${itemCount} item${itemCount === 1 ? '' : 's'} in ${blocks.length} group${blocks.length === 1 ? '' : 's'}` : undefined,
      )}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv}>
        <SearchField value={search} onChange={setSearch} placeholder="Search item or group" />
        <ColumnsMenu
          options={NUMERIC.map((col) => ({ key: col.key, label: col.label }))}
          hidden={hidden}
          onToggle={toggleHidden}
        />
      </ReportFilterBar>

      {data && blocks.length > 0 ? (
        <StatGrid>
          <StatTile primary label="Total sales" value={formatINR(Number(totals.total) || 0, 2)} />
          <StatTile label="Net amount" value={formatINR(Number(totals.net) || 0, 2)} />
          <StatTile label="Tax collected" value={formatINR(Number(totals.tax) || 0, 2)} />
          <StatTile
            label="Quantity sold"
            value={decimal(totals.qty)}
            hint={`${itemCount} items · ${blocks.length} groups`}
          />
        </StatGrid>
      ) : null}

      <ReportCard title="Group-wise sales" flush>
        {loading && !data ? (
          <LoadState loading error="" />
        ) : error ? (
          <LoadState loading={false} error={error} />
        ) : blocks.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No sales found for this date range.
          </p>
        ) : (
          <GroupedTable
            itemLabel="Item"
            itemKey="item"
            columns={columns}
            blocks={blocks}
            totals={totals}
            collapsed={collapsed}
            onToggle={toggleGroup}
            summaryKeys={[
              { key: 'qty', label: 'Qty' },
              { key: 'total', label: 'Total', money: true },
            ]}
            barKey="total"
            extraRows={
              roundOff !== 0 ? (
                <tr className="border-t border-line text-ink">
                  <td className={TD}>Round off</td>
                  {columns.map((col) => (
                    <td key={col.key} className={`${TD} text-right tabular-nums`}>
                      {col.key === 'total' ? decimal(roundOff) : ''}
                    </td>
                  ))}
                </tr>
              ) : null
            }
          />
        )}
      </ReportCard>
    </ReportShell>
  )
}
