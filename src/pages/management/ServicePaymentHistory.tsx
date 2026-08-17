import { useMemo, useState } from 'react'
import { FileText, Mail, Search } from 'lucide-react'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

type HistoryTab =
  | 'pg'
  | 'swiping'
  | 'mdr'
  | 'hardware'
  | 'security-deposit'
  | 'monthly-invoices'
  | 'restaurant-ledgers'

interface PgTransaction {
  id: string
  restaurant: string
  gstin: string
  proformaNo: string
  serviceOpted: string
  orderId: string
  proformaDate: string
  paidOn: string
  basicAmount: number
  cgst: number
  sgst: number
  igst: number
  grossAmount: number
  status: 'Paid' | 'Pending' | 'Failed'
  invoiceGenerated: boolean
}

const TABS: Array<{ id: HistoryTab; label: string }> = [
  { id: 'pg', label: 'PG Transactions' },
  { id: 'swiping', label: 'Swiping Transactions' },
  { id: 'mdr', label: 'MDR Transactions' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'security-deposit', label: 'Security Deposit' },
  { id: 'monthly-invoices', label: 'Monthly Invoices' },
  { id: 'restaurant-ledgers', label: 'Restaurant Ledgers' },
]

const TRANSACTION_TYPES = ['All', 'New', 'Renewal', 'Upgrade']
const SELECT_TYPES = ['All', 'Subscription', 'Addon', 'Hardware', 'Service']
const PAYMENT_TYPES = ['Select', 'PhonePe', 'Razorpay', 'Card', 'UPI', 'Net Banking']

const PG_ROWS: PgTransaction[] = [
  {
    id: '1',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT581118',
    serviceOpted: 'Bought KDS Service - Renewal',
    orderId: 'PPORD8821 (PhonePe)',
    proformaDate: '8 Jul 2026',
    paidOn: '7 Jul 2026',
    basicAmount: 12000,
    cgst: 0,
    sgst: 0,
    igst: 2160,
    grossAmount: 14160,
    status: 'Paid',
    invoiceGenerated: true,
  },
  {
    id: '2',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT580992',
    serviceOpted: 'Bought POS Subscription - Renewal 1 year',
    orderId: 'PPORD8790 (PhonePe)',
    proformaDate: '2 Jul 2026',
    paidOn: '2 Jul 2026',
    basicAmount: 25000,
    cgst: 0,
    sgst: 0,
    igst: 4500,
    grossAmount: 29500,
    status: 'Paid',
    invoiceGenerated: true,
  },
  {
    id: '3',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT580441',
    serviceOpted: 'Bought 1 Petpooja Payroll Goods',
    orderId: 'PPORD8712 (Razorpay)',
    proformaDate: '18 Jun 2026',
    paidOn: '18 Jun 2026',
    basicAmount: 8500,
    cgst: 0,
    sgst: 0,
    igst: 1530,
    grossAmount: 10030,
    status: 'Paid',
    invoiceGenerated: true,
  },
  {
    id: '4',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT579880',
    serviceOpted: 'Bought Online Ordering Module - Renewal',
    orderId: 'PPORD8655 (PhonePe)',
    proformaDate: '5 Jun 2026',
    paidOn: '5 Jun 2026',
    basicAmount: 7000,
    cgst: 0,
    sgst: 0,
    igst: 1260,
    grossAmount: 8260,
    status: 'Paid',
    invoiceGenerated: false,
  },
  {
    id: '5',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT579210',
    serviceOpted: 'Bought WhatsApp Marketing Credits',
    orderId: 'PPORD8588 (UPI)',
    proformaDate: '22 May 2026',
    paidOn: '22 May 2026',
    basicAmount: 5000,
    cgst: 0,
    sgst: 0,
    igst: 900,
    grossAmount: 5900,
    status: 'Paid',
    invoiceGenerated: true,
  },
  {
    id: '6',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT578640',
    serviceOpted: 'Bought Inventory Module - Renewal',
    orderId: 'PPORD8501 (PhonePe)',
    proformaDate: '10 May 2026',
    paidOn: '10 May 2026',
    basicAmount: 4500,
    cgst: 0,
    sgst: 0,
    igst: 810,
    grossAmount: 5310,
    status: 'Paid',
    invoiceGenerated: true,
  },
  {
    id: '7',
    restaurant: brand.shopName,
    gstin: '27BHFPJ0010E1Z4',
    proformaNo: 'CT578011',
    serviceOpted: 'Bought Support Priority Pack',
    orderId: 'PPORD8420 (Card)',
    proformaDate: '28 Apr 2026',
    paidOn: '28 Apr 2026',
    basicAmount: 3500,
    cgst: 0,
    sgst: 0,
    igst: 630,
    grossAmount: 4130,
    status: 'Paid',
    invoiceGenerated: true,
  },
]

const selectClass =
  'mt-1 block h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'
const inputClass =
  'mt-1 block h-9 w-full min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ServicePaymentHistory() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('pg')
  const [transactionType, setTransactionType] = useState('All')
  const [selectType, setSelectType] = useState('All')
  const [orderId, setOrderId] = useState('')
  const [paymentType, setPaymentType] = useState('Select')
  const [proformaNo, setProformaNo] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedOrderId, setAppliedOrderId] = useState('')
  const [appliedProformaNo, setAppliedProformaNo] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return PG_ROWS.filter((row) => {
      const orderOk =
        !appliedOrderId.trim() ||
        row.orderId.toLowerCase().includes(appliedOrderId.trim().toLowerCase())
      const proformaOk =
        !appliedProformaNo.trim() ||
        row.proformaNo
          .toLowerCase()
          .includes(appliedProformaNo.trim().toLowerCase())
      const paymentOk =
        paymentType === 'Select' ||
        row.orderId.toLowerCase().includes(paymentType.toLowerCase())
      return orderOk && proformaOk && paymentOk
    })
  }, [appliedOrderId, appliedProformaNo, paymentType])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => ({
        basic: acc.basic + row.basicAmount,
        igst: acc.igst + row.igst,
        gross: acc.gross + row.grossAmount,
      }),
      { basic: 0, igst: 0, gross: 0 },
    )
  }, [filtered])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedOrderId(orderId)
    setAppliedProformaNo(proformaNo)
    showToast('Search applied')
  }

  function handleShowAll() {
    setTransactionType('All')
    setSelectType('All')
    setOrderId('')
    setPaymentType('Select')
    setProformaNo('')
    setFromDate('')
    setToDate('')
    setAppliedOrderId('')
    setAppliedProformaNo('')
    showToast('Showing all records')
  }

  return (
    <ReportsPageShell
      title="Payment History"
      activeItem="acct-service-payment-history"
      actions={
        <ExportExcelMenu
          onExportPage={() => showToast('Exporting current page…')}
          onExportAll={() => showToast('Exporting all records…')}
        />
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'border-b-2 border-primary font-semibold text-primary'
                  : 'border-b-2 border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab !== 'pg' ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
          <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
            <Search size={48} strokeWidth={1.25} className="text-muted/45" />
          </span>
          <p className="text-base font-semibold text-ink">No Results Found.</p>
          <p className="mt-1 text-sm text-muted">
            No records available for this tab yet.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
            <label className="text-xs text-muted">
              Transaction Type
              <select
                value={transactionType}
                onChange={(event) => setTransactionType(event.target.value)}
                className={selectClass}
              >
                {TRANSACTION_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Select Type
              <select
                value={selectType}
                onChange={(event) => setSelectType(event.target.value)}
                className={selectClass}
              >
                {SELECT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[140px] text-xs text-muted">
              Order ID
              <input
                type="text"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-muted">
              Payment Type
              <select
                value={paymentType}
                onChange={(event) => setPaymentType(event.target.value)}
                className={selectClass}
              >
                {PAYMENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[140px] text-xs text-muted">
              Proforma No.
              <input
                type="text"
                value={proformaNo}
                onChange={(event) => setProformaNo(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-muted">
              From Proforma Date
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-muted">
              To Proforma Date
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className={inputClass}
              />
            </label>
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Show All
            </OutlineButton>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="border-b border-line bg-primary/5 text-xs font-semibold text-ink">
                  <tr>
                    <th className="px-3 py-3">Restaurant [GSTIN]</th>
                    <th className="px-3 py-3">Proforma No.</th>
                    <th className="px-3 py-3">Service Opted</th>
                    <th className="px-3 py-3">Order ID</th>
                    <th className="px-3 py-3">Proforma Date</th>
                    <th className="px-3 py-3">Paid On</th>
                    <th className="px-3 py-3 text-right">
                      Basic Amount
                      <span className="mt-0.5 block font-normal text-muted">
                        ({formatAmount(totals.basic)})
                      </span>
                    </th>
                    <th className="px-3 py-3 text-right">CGST Tax</th>
                    <th className="px-3 py-3 text-right">SGST Tax</th>
                    <th className="px-3 py-3 text-right">
                      IGST Tax
                      <span className="mt-0.5 block font-normal text-muted">
                        ({formatAmount(totals.igst)})
                      </span>
                    </th>
                    <th className="px-3 py-3 text-right">
                      Gross Amount
                      <span className="mt-0.5 block font-normal text-muted">
                        ({formatAmount(totals.gross)})
                      </span>
                    </th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Invoice Generated (Yes/No)</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={14}
                        className="px-4 py-16 text-center text-sm text-muted"
                      >
                        No Results Found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-line last:border-0 hover:bg-page/40"
                      >
                        <td className="px-3 py-3">
                          <p className="font-medium text-ink">{row.restaurant}</p>
                          <p className="text-xs text-muted">{row.gstin}</p>
                        </td>
                        <td className="px-3 py-3 text-ink">{row.proformaNo}</td>
                        <td className="max-w-[220px] px-3 py-3 text-ink">
                          {row.serviceOpted}
                        </td>
                        <td className="px-3 py-3 text-ink">{row.orderId}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-ink">
                          {row.proformaDate}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-ink">
                          {row.paidOn}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink">
                          {formatAmount(row.basicAmount)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink">
                          {formatAmount(row.cgst)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink">
                          {formatAmount(row.sgst)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink">
                          {formatAmount(row.igst)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-medium text-ink">
                          {formatAmount(row.grossAmount)}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-ink">
                          {row.invoiceGenerated ? 'Yes' : 'No'}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <RowActionButton
                              boxed
                              label="View invoice"
                              onClick={() =>
                                showToast(`Opening invoice ${row.proformaNo}`)
                              }
                            >
                              <FileText size={15} strokeWidth={1.75} />
                            </RowActionButton>
                            <RowActionButton
                              boxed
                              label="Email invoice"
                              onClick={() =>
                                showToast(`Emailing ${row.proformaNo}`)
                              }
                            >
                              <Mail size={15} strokeWidth={1.75} />
                            </RowActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line bg-page/50 px-4 py-3">
              <p className="text-sm text-muted">
                {filtered.length === 0
                  ? 'Showing 0 records'
                  : `Showing 1 to ${filtered.length} of ${filtered.length} records`}
              </p>
            </div>
          </div>
        </>
      )}
    </ReportsPageShell>
  )
}
