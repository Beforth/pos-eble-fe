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
import { decimal, reportSubtitle } from '../../components/reports/reportStyles'
import { fetchReportApi, type ReportResult } from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

const TOGGLEABLE = [
  { key: 'code', label: 'Code', text: true },
  { key: 'qty', label: 'Qty.' },
  { key: 'amount', label: 'Total (₹)' },
]

export default function VariationSummaryReport() {
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
    fetchReportApi(encryptedOutletId, 'variation-wise', { from, to })
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
    const byVariation = new Map<string, GroupedBlock>()
    for (const row of data?.rows ?? []) {
      const variation = String(row.variation)
      if (
        q &&
        !String(row.item).toLowerCase().includes(q) &&
        !variation.toLowerCase().includes(q)
      ) {
        continue
      }
      let block = byVariation.get(variation)
      if (!block) {
        block = { name: variation, rows: [], sums: {} }
        byVariation.set(variation, block)
      }
      block.rows.push(row)
      block.sums.qty = (block.sums.qty ?? 0) + (Number(row.qty) || 0)
      block.sums.amount = (block.sums.amount ?? 0) + (Number(row.amount) || 0)
    }
    return [...byVariation.values()]
  }, [data, search])

  const columns: GroupedColumn[] = TOGGLEABLE.filter((col) => !hidden.has(col.key))
  const totals = data?.totals ?? {}
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
    const body = blocks.flatMap((block) =>
      block.rows.map((row) => [
        row.variation,
        row.item,
        ...columns.map((col) => row[col.key] ?? ''),
      ]),
    )
    downloadCsv(
      `variation-report_${from}_${to}.csv`,
      ['Variation', 'Item', ...columns.map((col) => col.label)],
      body,
    )
  }

  return (
    <ReportShell
      title="Variation Report"
      subtitle={reportSubtitle(
        from,
        to,
        data ? `${itemCount} item${itemCount === 1 ? '' : 's'} in ${blocks.length} variation${blocks.length === 1 ? '' : 's'}` : undefined,
      )}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv}>
        <SearchField value={search} onChange={setSearch} placeholder="Search item or variation" />
        <ColumnsMenu
          options={TOGGLEABLE.map((col) => ({ key: col.key, label: col.label }))}
          hidden={hidden}
          onToggle={toggleHidden}
        />
      </ReportFilterBar>

      {data && blocks.length > 0 ? (
        <StatGrid>
          <StatTile primary label="Total sales" value={formatINR(Number(totals.amount) || 0, 2)} />
          <StatTile label="Quantity sold" value={decimal(totals.qty)} />
          <StatTile label="Variations" value={blocks.length} />
          <StatTile label="Items" value={itemCount} />
        </StatGrid>
      ) : null}

      <ReportCard title="Variation-wise sales" flush>
        {loading && !data ? (
          <LoadState loading error="" />
        ) : error ? (
          <LoadState loading={false} error={error} />
        ) : blocks.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No variation sales found for this date range.
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
              { key: 'amount', label: 'Total', money: true },
            ]}
            barKey="amount"
          />
        )}
      </ReportCard>
    </ReportShell>
  )
}
