import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  fetchReportApi,
  type ReportCell,
  type ReportResult,
  type ReportSlug,
} from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'
import {
  ColumnsMenu,
  LoadState,
  ReportCard,
  ReportFilterBar,
  ReportShell,
  SearchField,
  StatGrid,
  StatTile,
} from './ReportShell'
import { Pagination } from '../common/Pagination'
import { TD, TH, decimal, money, reportSubtitle } from './reportStyles'

type Row = Record<string, ReportCell>

export interface ReportTileSpec {
  label: string
  value: ReactNode
  hint?: ReactNode
  primary?: boolean
}

interface DataReportPageProps {
  title: string
  /** Heading of the table card. */
  tableTitle: string
  slug: ReportSlug
  /** CSV file name, without the date range. */
  fileName: string
  /** Row keys the search box looks in; every text column when left out. */
  searchKeys?: string[]
  searchPlaceholder?: string
  /** Up to four headline tiles from the loaded report; worked out from the totals when left out. */
  tiles?: (ctx: { rows: Row[]; totals: Row; data: ReportResult }) => ReportTileSpec[]
  /** Rows per page; every row on one page when left out. */
  pageSize?: number
  /** Where Back goes; `null` hides it. */
  backTo?: string | null
  /** A numeric column drawn as a bar under the first column's value. */
  barKey?: string
  emptyText?: string
  /** Offer the Columns menu (reports with many payment columns). */
  columnsMenu?: boolean
}

/** Headline tiles for a report with no tailor-made ones: the lead money total, the row count, then other totals. */
function defaultTiles({ rows, totals, data }: { rows: Row[]; totals: Row; data: ReportResult }): ReportTileSpec[] {
  const numeric = data.columns.filter((col) => col.type !== 'text' && totals[col.key] !== undefined)
  const moneyCols = numeric.filter((col) => col.type === 'money')
  const lead = moneyCols.find((col) => /total|amount|net/.test(col.key)) ?? moneyCols[0]
  const label = (text: string) => text.replace(/ \(₹\)$/, '')
  const others = numeric.filter((col) => col !== lead).slice(0, 2)
  return [
    ...(lead
      ? [{ label: label(lead.label), value: money(totals[lead.key]), primary: true }]
      : []),
    { label: 'Rows', value: rows.length, primary: !lead },
    ...others.map((col) => ({
      label: label(col.label),
      value: col.type === 'money' ? money(totals[col.key]) : String(totals[col.key]),
    })),
  ].slice(0, 4)
}

function formatCell(value: ReportCell | undefined, type: string): string {
  if (value === undefined || value === '') return ''
  return type === 'money' ? decimal(value) : String(value)
}

/**
 * A report fed by one `fetchReportApi` call: filter bar, tiles, and a table
 * of the columns the server sends with its totals row. The table-shaped
 * reports (Captain Wise, Settlement, NC Item, Assignee Wise, Tax) are thin
 * configurations of this.
 */
export function DataReportPage({
  title,
  tableTitle,
  slug,
  fileName,
  searchKeys,
  searchPlaceholder = 'Search',
  tiles = defaultTiles,
  pageSize,
  backTo,
  barKey,
  emptyText = 'No sales found for this date range.',
  columnsMenu,
}: DataReportPageProps) {
  const { encryptedOutletId } = useAuth()
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, slug, { from, to })
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
  }, [encryptedOutletId, slug, from, to])

  const columns = useMemo(
    () => (data?.columns ?? []).filter((col) => !hidden.has(col.key)),
    [data, hidden],
  )
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = data?.rows ?? []
    if (!q) return all
    const keys = searchKeys ?? (data?.columns ?? []).filter((c) => c.type === 'text').map((c) => c.key)
    return all.filter((row) =>
      keys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
    )
  }, [data, search, searchKeys])
  const totals = data?.totals ?? {}
  const hasTotals = data != null && Object.keys(data.totals).length > 0
  const topBar = barKey ? Math.max(0, ...rows.map((row) => Number(row[barKey]) || 0)) : 0
  const firstKey = data?.columns[0]?.key
  // Many columns scroll sideways: the first one stays in view.
  const stickyFirst = columns.length > 6

  // The page restarts at 1 whenever the filters change, without an effect: a
  // page number is only trusted while the filters it was chosen under hold.
  const filterKey = [slug, from, to, search].join('|')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const lastPage = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const currentPage = Math.min(pageState.key === filterKey ? pageState.page : 1, lastPage)
  const visibleRows = pageSize
    ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : rows

  function toggleHidden(key: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function setRange(nextFrom: string, nextTo: string) {
    setFrom(nextFrom)
    setTo(nextTo)
  }

  function exportCsv() {
    if (rows.length === 0 || !data) {
      showToast('Nothing to export')
      return
    }
    const body = rows.map((row) => columns.map((col) => row[col.key] ?? ''))
    if (hasTotals) body.push(columns.map((col) => data.totals[col.key] ?? ''))
    downloadCsv(
      `${fileName}_${from}_${to}.csv`,
      columns.map((col) => col.label),
      body,
    )
  }

  const tileSpecs = data && rows.length > 0 ? tiles({ rows, totals, data }) : []

  return (
    <ReportShell
      title={title}
      backTo={backTo}
      subtitle={reportSubtitle(
        from,
        to,
        data ? `${rows.length} row${rows.length === 1 ? '' : 's'}` : undefined,
      )}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv}>
        <SearchField value={search} onChange={setSearch} placeholder={searchPlaceholder} />
        {columnsMenu ? (
          <ColumnsMenu
            options={(data?.columns ?? [])
              .filter((col) => col.key !== firstKey)
              .map((col) => ({ key: col.key, label: col.label }))}
            hidden={hidden}
            onToggle={toggleHidden}
          />
        ) : null}
      </ReportFilterBar>

      {tileSpecs.length > 0 ? (
        <StatGrid>
          {tileSpecs.map((tile) => (
            <StatTile
              key={tile.label}
              label={tile.label}
              value={tile.value}
              hint={tile.hint}
              primary={tile.primary}
            />
          ))}
        </StatGrid>
      ) : null}

      <ReportCard title={tableTitle} flush>
        {loading && !data ? (
          <LoadState loading error="" />
        ) : error ? (
          <LoadState loading={false} error={error} />
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary/5">
                  {columns.map((col, index) => (
                    <th
                      key={col.key}
                      className={`${TH} ${col.type === 'text' ? 'text-left' : 'text-right'} ${
                        stickyFirst && index === 0 ? 'sticky left-0 z-10 bg-[#fff1f2]' : ''
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group border-t border-line hover:bg-page/60">
                    {columns.map((col, index) => (
                      <td
                        key={col.key}
                        className={`${TD} ${
                          col.type === 'text' ? '' : 'text-right tabular-nums'
                        } ${index === 0 ? 'font-semibold' : ''} ${
                          stickyFirst && index === 0
                            ? 'sticky left-0 z-10 bg-card group-hover:bg-page'
                            : ''
                        }`}
                      >
                        {formatCell(row[col.key], col.type)}
                        {barKey && index === 0 && topBar > 0 ? (
                          <span className="mt-1.5 block h-1 w-40 max-w-full overflow-hidden rounded-full bg-line">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.min(100, ((Number(row[barKey]) || 0) / topBar) * 100)}%`,
                              }}
                            />
                          </span>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {hasTotals ? (
                <tfoot>
                  <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
                    {columns.map((col, index) => (
                      <td
                        key={col.key}
                        className={`${TD} ${col.type === 'text' ? '' : 'text-right tabular-nums'} ${
                          stickyFirst && index === 0 ? 'sticky left-0 z-10 bg-[#fff1f2]' : ''
                        }`}
                      >
                        {formatCell(totals[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        )}
      </ReportCard>

      {pageSize ? (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={(next) => setPageState({ key: filterKey, page: next })}
        />
      ) : null}
      {data?.truncated ? (
        <p className="text-xs text-muted">
          Showing the first 5,000 rows. Narrow the date range to see the rest.
        </p>
      ) : null}
    </ReportShell>
  )
}
