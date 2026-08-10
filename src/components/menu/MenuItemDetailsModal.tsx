import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ImageIcon, X } from 'lucide-react'
import {
  baseMenuCategories,
  type MenuItemRow,
} from '../../mocks/menuItemsData'

interface MenuItemDetailsModalProps {
  open: boolean
  item: MenuItemRow | null
  onClose: () => void
}

const AREA_PRICES = [
  { area: 'Home Delivery', price: 40, status: 'Active' },
  { area: 'Zomato', price: 56, status: 'Active' },
  { area: 'Swiggy', price: 56, status: 'Active' },
  { area: 'Parcel', price: 40, status: 'Active' },
  { area: 'Home Website', price: 50, status: 'Active' },
] as const

function DetailCell({
  label,
  value,
  fullWidth = false,
}: {
  label: string
  value?: string | number | null
  fullWidth?: boolean
}) {
  return (
    <div
      className={`flex gap-3 border-b border-line px-4 py-2.5 text-sm ${
        fullWidth ? 'col-span-2' : ''
      }`}
    >
      <span className="w-[42%] shrink-0 font-medium text-ink sm:w-44">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-ink">{value || ''}</span>
    </div>
  )
}

function ImageCell({
  label,
  showImage,
}: {
  label: string
  showImage?: boolean
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-sm">
      <span className="w-[42%] shrink-0 font-medium text-ink sm:w-44">
        {label}
      </span>
      {showImage ? (
        <span className="inline-flex size-14 items-center justify-center overflow-hidden rounded border border-line bg-page text-muted">
          <ImageIcon size={22} />
        </span>
      ) : (
        <span className="text-muted">—</span>
      )}
    </div>
  )
}

export function MenuItemDetailsModal({
  open,
  item,
  onClose,
}: MenuItemDetailsModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open || !item) return null

  const categoryName =
    baseMenuCategories.find((category) => category.id === item.categoryId)
      ?.name ?? ''

  const areaPrices = AREA_PRICES.map((row) =>
    row.area === 'Home Delivery' || row.area === 'Parcel'
      ? { ...row, price: item.price }
      : {
          ...row,
          price: Math.round(item.price * 1.4),
        },
  )

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
        aria-labelledby="menu-item-details-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="menu-item-details-title"
            className="text-base font-semibold text-ink"
          >
            Menu Item Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid sm:grid-cols-2">
            <DetailCell label="Name" value={item.name} />
            <DetailCell label="Short Code" value={item.shortCode} />
            <DetailCell label="Short Code 2" value="" />
            <DetailCell
              label="Online Display Name"
              value={item.onlineDisplayName}
            />
            <DetailCell
              label="Expose This Items In"
              value="Online Orders, Captain App"
            />
            <DetailCell
              label="Order Type"
              value="PARCEL, DINE IN, Dine In"
            />
            <DetailCell
              label="Item Description"
              value={item.description}
              fullWidth
            />
            <DetailCell label="Category" value={categoryName} />
            <DetailCell label="Item Price" value={item.price} />
            <DetailCell label="Item Unit" value="" />
            <DetailCell label="Create Self Item Recipe" value="No" />

            <ImageCell label="Zomato Image" showImage={item.hasImage} />
            <ImageCell label="Swiggy Image" showImage={item.hasImage} />
            <ImageCell label="Home Website Image" showImage={item.hasImage} />
            <div className="border-b border-line" />
            <ImageCell label="Dunzo Image" />
            <ImageCell
              label="Offline Orders Image"
              showImage={item.hasImage}
            />
            <ImageCell label="Paytm Image" />
            <ImageCell label="GooglePay Image" />
            <ImageCell label="Uengage Image" />
            <div className="border-b border-line" />

            <DetailCell label="Ignore Tax" value="No" />
            <DetailCell label="Ignore Discount" value="No" />
            <DetailCell label="HSN Code" value="" />
            <DetailCell label="Set As Favorite" value="Yes" />
            <DetailCell label="Set As Open Item" value="No" />
            <DetailCell label="Open Quantity Popup" value="No" />
            <DetailCell label="Stock Status" value="Do Not Track" />
            <DetailCell label="Sap Code" value="" />
            <DetailCell label="Days" value="All Days" />
            <DetailCell label="Profit Margin (%)" value="" />
            <DetailCell label="Weight(In grams/ml)" value="" fullWidth />
            <DetailCell
              label="Choice"
              value={item.tags.includes('V+') ? 'veg' : 'veg'}
              fullWidth
            />
            <DetailCell label="Long Description" value="" fullWidth />
            <DetailCell label="FSN Code" value="" fullWidth />
          </div>

          <div className="border-t border-line px-4 py-3">
            <h3 className="mb-3 text-sm font-semibold text-ink">
              Area Wise Price
            </h3>
            <div className="overflow-hidden rounded-md border border-line">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-primary/5 text-ink">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Area Name</th>
                    <th className="px-3 py-2 font-semibold">Price</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {areaPrices.map((row, index) => (
                    <tr
                      key={row.area}
                      className={`border-t border-line ${
                        index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                      }`}
                    >
                      <td className="px-3 py-2 text-ink">{row.area}</td>
                      <td className="px-3 py-2 tabular-nums text-ink">
                        {row.price}
                      </td>
                      <td className="px-3 py-2 font-medium text-success">
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              <span className="font-medium text-ink">Container Charges</span>
              <span className="text-ink">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
