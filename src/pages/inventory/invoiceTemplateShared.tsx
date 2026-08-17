import { brand } from '../../theme/brand'
import { BrandLogo } from '../../components/brand/BrandLogo'

export type InvoiceTabId = 'purchase' | 'purchase-order' | 'sales' | 'transfer'

export interface InvoiceTemplate {
  id: string
  name: string
  variant: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
}

export const INVOICE_TABS: { id: InvoiceTabId; label: string }[] = [
  { id: 'purchase', label: 'Purchase' },
  { id: 'purchase-order', label: 'Purchase Order' },
  { id: 'sales', label: 'Sales' },
  { id: 'transfer', label: 'Transfer' },
]

export const TEMPLATES_BY_TAB: Record<InvoiceTabId, InvoiceTemplate[]> = {
  purchase: [
    { id: 'purchase-standard', name: 'Standard Template', variant: 0 },
    { id: 'purchase-1', name: 'Template 1', variant: 1 },
    { id: 'purchase-2', name: 'Template 2', variant: 2 },
    { id: 'purchase-3', name: 'Template 3', variant: 3 },
    { id: 'purchase-4', name: 'Template 4', variant: 4 },
    { id: 'purchase-5', name: 'Template 5', variant: 5 },
  ],
  'purchase-order': [
    { id: 'po-standard', name: 'Standard Template', variant: 0 },
    { id: 'po-1', name: 'Template 1', variant: 1 },
    { id: 'po-2', name: 'Template 2', variant: 2 },
    { id: 'po-3', name: 'Template 3', variant: 3 },
    { id: 'po-4', name: 'Template 4', variant: 4 },
    { id: 'po-5', name: 'Template 5', variant: 5 },
  ],
  sales: [
    { id: 'sales-standard', name: 'Standard Template', variant: 0 },
    { id: 'sales-1', name: 'Template 1', variant: 1 },
    { id: 'sales-2', name: 'Template 2', variant: 2 },
    { id: 'sales-3', name: 'Template 3', variant: 3 },
    { id: 'sales-4', name: 'Template 4', variant: 4 },
    { id: 'sales-5', name: 'Template 5', variant: 5 },
    { id: 'sales-6', name: 'Template 6', variant: 6 },
    { id: 'sales-7', name: 'Template 7', variant: 7 },
  ],
  transfer: [
    { id: 'transfer-standard', name: 'Standard Template', variant: 0 },
    { id: 'transfer-1', name: 'Template 1', variant: 1 },
    { id: 'transfer-2', name: 'Template 2', variant: 2 },
    { id: 'transfer-3', name: 'Template 3', variant: 3 },
    { id: 'transfer-4', name: 'Template 4', variant: 4 },
  ],
}

export const SELECT_LABEL: Record<InvoiceTabId, string> = {
  purchase: 'Select For Purchase Pdf',
  'purchase-order': 'Select For Purchase Order Pdf',
  sales: 'Select For Sales Pdf',
  transfer: 'Select For Transfer Pdf',
}

const DOC_TITLE: Record<InvoiceTabId, string> = {
  purchase: 'Purchase',
  'purchase-order': 'Purchase Order',
  sales: 'Sales',
  transfer: 'Transfer',
}

const SAMPLE_ITEMS = [
  {
    category: 'Alcohol product',
    name: '8 Pm Whisky',
    hsn: '2208',
    unit: 'Bottle',
    qty: '2.000',
    rate: '850.00',
    amount: '1,700.00',
  },
  {
    category: 'Baking essentials',
    name: 'Breadcrumbs',
    hsn: '1905',
    unit: 'Kg',
    qty: '1.500',
    rate: '120.00',
    amount: '180.00',
  },
  {
    category: 'Condiments',
    name: 'Barbecue Sauce',
    hsn: '2103',
    unit: 'Bottle',
    qty: '3.000',
    rate: '95.00',
    amount: '285.00',
  },
  {
    category: 'Grocery',
    name: 'Black Olives',
    hsn: '2005',
    unit: 'Tin',
    qty: '2.000',
    rate: '210.00',
    amount: '420.00',
  },
  {
    category: 'Dairy',
    name: 'Butter',
    hsn: '0405',
    unit: 'Kg',
    qty: '1.000',
    rate: '480.00',
    amount: '480.00',
  },
]

export function isInvoiceTabId(value: string): value is InvoiceTabId {
  return value in TEMPLATES_BY_TAB
}

export function getTemplate(
  tab: InvoiceTabId,
  templateId: string,
): InvoiceTemplate | undefined {
  return TEMPLATES_BY_TAB[tab].find((item) => item.id === templateId)
}

export function InvoiceDocumentPreview({
  tab,
  templateName,
}: {
  tab: InvoiceTabId
  templateName: string
}) {
  return (
    <div className="mx-auto w-full max-w-4xl rounded-md border border-line bg-card p-5 text-sm shadow-sm sm:p-8">
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-line pb-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <BrandLogo size={36} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {brand.shortName}
              </p>
              <p className="text-lg font-bold text-accent">{DOC_TITLE[tab]}</p>
            </div>
          </div>
          <p className="font-semibold text-ink">{brand.outletName}</p>
          <p className="text-xs text-muted">
            Dadar, Mumbai · Maharashtra · India
          </p>
          <p className="text-xs text-muted">GSTIN: 27AAAAA0000A1Z5</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex size-16 items-center justify-center border border-line bg-page text-[10px] font-medium text-muted">
            QR
          </span>
          <p className="text-[10px] text-muted">{templateName}</p>
        </div>
      </div>

      <div className="mb-4 grid gap-2 text-xs sm:grid-cols-2">
        <p>
          <span className="text-muted">Vendor : </span>
          <span className="font-medium text-ink">Dmk traders</span>
        </p>
        <p>
          <span className="text-muted">Location : </span>
          <span className="font-medium text-ink">Ahmedabad</span>
        </p>
        <p>
          <span className="text-muted">Challan No. : </span>
          <span className="font-medium text-ink">CH-1024</span>
        </p>
        <p>
          <span className="text-muted">Date : </span>
          <span className="font-medium text-ink">12 Aug 2026</span>
        </p>
        <p>
          <span className="text-muted">Order No. : </span>
          <span className="font-medium text-ink">ORD-5581</span>
        </p>
        <p>
          <span className="text-muted">Place of Supply : </span>
          <span className="font-medium text-ink">Gujarat</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="min-w-[640px] w-full text-left text-xs">
          <thead className="bg-page text-[11px] font-semibold text-ink">
            <tr>
              <th className="px-2 py-2">Sr No</th>
              <th className="px-2 py-2">Description of Goods</th>
              <th className="px-2 py-2">HSN/SAC</th>
              <th className="px-2 py-2">Size/Unit</th>
              <th className="px-2 py-2 text-right">Quantity</th>
              <th className="px-2 py-2 text-right">Rate</th>
              <th className="px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ITEMS.map((item, index) => (
              <tr key={item.name} className="border-t border-line">
                <td className="px-2 py-2 align-top text-muted">{index + 1}</td>
                <td className="px-2 py-2 align-top">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {item.category}
                  </p>
                  <p className="font-medium text-ink">{item.name}</p>
                </td>
                <td className="px-2 py-2 align-top text-ink">{item.hsn}</td>
                <td className="px-2 py-2 align-top text-ink">{item.unit}</td>
                <td className="px-2 py-2 align-top text-right text-ink">
                  {item.qty}
                </td>
                <td className="px-2 py-2 align-top text-right text-ink">
                  {item.rate}
                </td>
                <td className="px-2 py-2 align-top text-right font-medium text-ink">
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-xs">
        <div className="flex justify-between text-ink">
          <span>Total</span>
          <span className="font-medium">3,065.00</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Round Off</span>
          <span>0.00</span>
        </div>
        <div className="flex justify-between border-t border-line pt-1 text-sm font-semibold text-ink">
          <span>Grand Total</span>
          <span>3,065.00</span>
        </div>
      </div>
    </div>
  )
}
