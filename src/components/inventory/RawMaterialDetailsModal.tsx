import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { RawMaterialRow } from '../../mocks/rawMaterialsData'

export interface RawMaterialDetails {
  name: string
  barcode: string
  reconciliationPrice: string
  purchasePrice: string
  transferPrice: string
  taxType: string
  taxPercent: string
  purchaseUnit: string
  closingStockOn: string
  consumptionUnit: string
  conversionQty: string
  hsnCode: string
  normalLoss: string
  category: string
  favorite: string
  minStockLevel: string
  minStockUnit: string
  atParStockLevel: string
  atParStockUnit: string
  maxStockLevel: string
  exclusive: string
  isExpiry: string
  description: string
  quantityGmMl: string
  gtin: string
  subCategory: string
  rank: string
  brand: string
  allowDecimal: string
}

interface RawMaterialDetailsModalProps {
  open: boolean
  details: RawMaterialDetails | null
  onClose: () => void
}

function DetailRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string
  leftValue: string
  rightLabel?: string
  rightValue?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-line py-2.5 last:border-b-0 sm:grid-cols-2">
      <div className="flex gap-2 text-sm">
        <span className="min-w-[140px] shrink-0 font-medium text-ink sm:min-w-[160px]">
          {leftLabel}:
        </span>
        <span className="min-w-0 break-words text-muted">
          {leftValue || '—'}
        </span>
      </div>
      {rightLabel != null ? (
        <div className="flex gap-2 text-sm">
          <span className="min-w-[140px] shrink-0 font-medium text-ink sm:min-w-[160px]">
            {rightLabel}:
          </span>
          <span className="min-w-0 break-words text-muted">
            {rightValue || '—'}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export function buildRawMaterialDetails(
  row: RawMaterialRow,
): RawMaterialDetails {
  const purchaseUnitsByCategory: Record<string, string> = {
    'Oils/masala/salt/sugar': 'BOX, pkt, jar, TIN, GM, Kg',
    'Fruits/vegetables': 'Kg, GM, BOX',
    'Bread/dairy': 'Ltr, Kg, Pcs, BOX',
    'Rice/pulses/flours': 'Kg, GM, pkt, BOX',
    Snacks: 'pkt, BOX, Kg',
    'Sauces/dressings/marinades': 'jar, bottle, Ltr, GM',
    'Ready To Cook/ready To Eat': 'pkt, BOX, Pcs',
    'Packaging/storage': 'Pcs, BOX, pkt',
  }

  return {
    name: row.name,
    barcode: '',
    reconciliationPrice: '0',
    purchasePrice: '0',
    transferPrice: '0',
    taxType: 'GST',
    taxPercent: '0',
    purchaseUnit:
      purchaseUnitsByCategory[row.category] ?? 'Kg, GM, BOX',
    closingStockOn: 'Daily',
    consumptionUnit: 'GM',
    conversionQty: '1000',
    hsnCode: '',
    normalLoss: '0',
    category: row.category,
    favorite: row.favourite ? 'Yes' : 'No',
    minStockLevel: '0',
    minStockUnit: '',
    atParStockLevel: '0',
    atParStockUnit: '',
    maxStockLevel: '',
    exclusive: 'No',
    isExpiry: 'No',
    description: '',
    quantityGmMl: '0',
    gtin: '',
    subCategory: '',
    rank: '',
    brand: '',
    allowDecimal: 'Yes',
  }
}

export function RawMaterialDetailsModal({
  open,
  details,
  onClose,
}: RawMaterialDetailsModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !details) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Raw Material Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          <DetailRow leftLabel="Name" leftValue={details.name} />
          <DetailRow
            leftLabel="Barcode/Short Code"
            leftValue={details.barcode}
            rightLabel="Reconciliation Price"
            rightValue={details.reconciliationPrice}
          />
          <DetailRow
            leftLabel="Purchase Price"
            leftValue={details.purchasePrice}
            rightLabel="Transfer Price"
            rightValue={details.transferPrice}
          />
          <DetailRow
            leftLabel="Tax Type"
            leftValue={details.taxType}
            rightLabel="Tax(%)"
            rightValue={details.taxPercent}
          />
          <DetailRow
            leftLabel="Purchase Unit"
            leftValue={details.purchaseUnit}
            rightLabel="Closing stock calculated on"
            rightValue={details.closingStockOn}
          />
          <DetailRow
            leftLabel="Consumption Unit"
            leftValue={details.consumptionUnit}
            rightLabel="Conversion Qty."
            rightValue={details.conversionQty}
          />
          <DetailRow
            leftLabel="HSN Code"
            leftValue={details.hsnCode}
            rightLabel="Normal loss (%)"
            rightValue={details.normalLoss}
          />
          <DetailRow
            leftLabel="Category"
            leftValue={details.category}
            rightLabel="Favorite"
            rightValue={details.favorite}
          />
          <DetailRow
            leftLabel="Minimum Stock Level"
            leftValue={details.minStockLevel}
            rightLabel="Minimum Stock Level Unit"
            rightValue={details.minStockUnit}
          />
          <DetailRow
            leftLabel="At Par Stock Level"
            leftValue={details.atParStockLevel}
            rightLabel="At Par Stock Level Unit"
            rightValue={details.atParStockUnit}
          />
          <DetailRow
            leftLabel="Maximum Stock Level"
            leftValue={details.maxStockLevel}
          />
          <DetailRow
            leftLabel="Exclusive to this restaurant"
            leftValue={details.exclusive}
            rightLabel="Is Expiry"
            rightValue={details.isExpiry}
          />
          <DetailRow
            leftLabel="Description"
            leftValue={details.description}
          />
          <DetailRow
            leftLabel="Quantity (in gm/ml)"
            leftValue={details.quantityGmMl}
            rightLabel="GTIN"
            rightValue={details.gtin}
          />
          <DetailRow
            leftLabel="Sub Category"
            leftValue={details.subCategory}
            rightLabel="Rank"
            rightValue={details.rank}
          />
          <DetailRow
            leftLabel="Brand"
            leftValue={details.brand}
            rightLabel="Allow Decimal Quantity"
            rightValue={details.allowDecimal}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
