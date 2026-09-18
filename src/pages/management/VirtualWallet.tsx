import { useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { FileText } from 'lucide-react'
import { SortableTh } from '../../components/common/SortableTh'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { useListQuery } from '../../hooks/useListQuery'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

interface WalletRow {
  id: string
  mobileNo: string
  remainingAmount: number
  created: string
}

const WALLET_ROWS: WalletRow[] = [
  {
    id: 'vw-1',
    mobileNo: '',
    remainingAmount: 17100,
    created: '9 Sep 2023 23:05:22',
  },
  {
    id: 'vw-2',
    mobileNo: '',
    remainingAmount: 17000,
    created: '9 Sep 2023 22:25:23',
  },
  {
    id: 'vw-3',
    mobileNo: '',
    remainingAmount: 5000,
    created: '1 Jan 2023 01:56:13',
  },
]

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function VirtualWallet() {
  const [mobileNo, setMobileNo] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedMobile, setAppliedMobile] = useState('')

  const filteredRows = useMemo(() => {
    const query = appliedMobile.trim()
    if (!query) return WALLET_ROWS
    return WALLET_ROWS.filter((row) => row.mobileNo.includes(query))
  }, [appliedMobile])

  const remainingTotal = useMemo(
    () => filteredRows.reduce((sum, row) => sum + row.remainingAmount, 0),
    [filteredRows],
  )

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    filteredRows,
    (row) => [row.mobileNo, row.remainingAmount, row.created],
    (row, key) => {
      if (key === 'remainingAmount') return row.remainingAmount
      if (key === 'created') return row.created
      return row.mobileNo
    },
  )


  function handleSearch() {
    setAppliedMobile(mobileNo)
    showToast('Search applied')
  }

  function handleShowAll() {
    setMobileNo('')
    setStartDate('')
    setEndDate('')
    setAppliedMobile('')
    showToast('Filters cleared')
  }

  return (
    <ReportsPageShell title="Virtual Wallet" activeItem="acct-virtual-wallet">

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <label className="min-w-[180px] flex-1 text-xs text-muted sm:max-w-[220px]">
          Customer Mobile No.
          <input
            type="text"
            value={mobileNo}
            onChange={(event) => setMobileNo(event.target.value)}
            className="mt-1 block h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs text-muted">
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1 block h-9 min-w-[150px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs text-muted">
          End Date
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1 block h-9 min-w-[150px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
        <OutlineButton onClick={handleShowAll}>Clear Filter</OutlineButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-primary/5 text-sm font-semibold text-ink">
              <tr>
                <SortableTh
                  columnKey="mobileNo"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-4 py-3"
                >
                  Mobile No.
                </SortableTh>
                <SortableTh
                  columnKey="remainingAmount"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="center"
                  className="px-4 py-3"
                >
                  Remaining Amount ({brand.currency}) ({formatAmount(remainingTotal)})
                </SortableTh>
                <SortableTh
                  columnKey="created"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="center"
                  className="px-4 py-3"
                >
                  Created
                </SortableTh>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-16 text-center text-sm text-muted"
                  >
                    No wallet records found.
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3 text-ink">{row.mobileNo}</td>
                    <td className="px-4 py-3 text-center text-ink">
                      {formatAmount(row.remainingAmount)}
                    </td>
                    <td className="px-4 py-3 text-center text-ink">
                      {row.created}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActionButton
                          boxed
                          label="View details"
                          onClick={() =>
                            showToast(
                              `Wallet details · ${formatAmount(row.remainingAmount)}`,
                            )
                          }
                        >
                          <FileText size={15} strokeWidth={1.75} />
                        </RowActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line bg-page/60 px-4 py-3">
          <p className="text-sm text-muted">
            {visible.length === 0
              ? 'Showing 0 records'
              : `Showing 1 to ${visible.length} of ${visible.length} records`}
          </p>
        </div>
      </div>
    </ReportsPageShell>
  )
}
