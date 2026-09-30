import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Item } from '../../types/menu'

interface MenuItemDetailsModalProps {
  open: boolean
  item: Item | null
  onClose: () => void
}

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

function ImagesCell({ images }: { images: Item['images'] }) {
  return (
    <div className="flex flex-col gap-2 border-b border-line px-4 py-2.5 text-sm sm:col-span-2">
      <span className="shrink-0 font-medium text-ink">
        Images ({images.length})
      </span>
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((image) => (
            <span
              key={image.id}
              title={image.channel_slug ?? undefined}
              className="inline-flex size-14 items-center justify-center overflow-hidden rounded border border-line bg-page"
            >
              <img
                src={image.image}
                alt={image.channel_slug ?? 'item image'}
                className="size-full object-cover"
              />
            </span>
          ))}
        </div>
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
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid sm:grid-cols-2">
            <DetailCell label="Name" value={item.name} />
            <DetailCell label="Category" value={item.category_name} />
            <DetailCell label="Item Price" value={item.base_price} />
            <DetailCell
              label="Online Display Name"
              value={item.online_display_name}
            />
            <DetailCell label="Short Code" value={item.short_code} />
            <DetailCell label="Short Code 2" value={item.short_code_2} />
            <DetailCell label="Item Unit" value={item.item_unit} />
            <DetailCell label="Stock Status" value={item.stock_status} />
            <DetailCell label="Rank" value={item.rank} />
            <DetailCell label="Is Active" value={item.is_active ? 'Yes' : 'No'} />
            <DetailCell label="Choice" value={item.choice} />
            <DetailCell label="Tags" value={item.tags.join(', ')} />
            <DetailCell label="Order Types" value={item.order_types.join(', ')} />
            <DetailCell label="Days" value={item.days.join(', ')} />
            <DetailCell
              label="Item Description"
              value={item.description}
              fullWidth
            />
            <DetailCell
              label="Long Description"
              value={item.long_description}
              fullWidth
            />
          </div>

          <div className="grid border-t border-line sm:grid-cols-2">
            <DetailCell label="Ignore Tax" value={item.flags.ignore_tax ? 'Yes' : 'No'} />
            <DetailCell
              label="Ignore Discount"
              value={item.flags.ignore_discount ? 'Yes' : 'No'}
            />
            <DetailCell
              label="Set As Favorite"
              value={item.flags.set_as_favorite ? 'Yes' : 'No'}
            />
            <DetailCell label="Open Item" value={item.flags.open_item ? 'Yes' : 'No'} />
            <DetailCell
              label="Open Quantity Popup"
              value={item.flags.open_quantity_popup ? 'Yes' : 'No'}
            />
            <DetailCell
              label="Create Self Item Recipe"
              value={item.flags.create_self_recipe ? 'Yes' : 'No'}
            />
            <DetailCell label="Sap Code" value={item.sap_code} />
            <DetailCell label="HSN Code" value={item.hsn_code} />
            <DetailCell label="FSN Code" value={item.fsn_code} />
            <DetailCell
              label="Profit Margin (%)"
              value={item.profit_margin}
              fullWidth
            />
            <DetailCell
              label="Weight (In grams/ml)"
              value={item.weight}
              fullWidth
            />
            <ImagesCell images={item.images} />
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
                  {item.area_prices.length > 0 ? (
                    item.area_prices.map((row, index) => (
                      <tr
                        key={row.outlet_channel_id}
                        className={`border-t border-line ${
                          index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                        }`}
                      >
                        <td className="px-3 py-2 text-ink">
                          {row.channel_label}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-ink">
                          {row.price}
                        </td>
                        <td
                          className={`px-3 py-2 font-medium ${
                            row.is_active ? 'text-success' : 'text-muted'
                          }`}
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-4 text-center text-sm text-muted"
                      >
                        No area prices configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-line px-4 py-3">
            <h3 className="mb-3 text-sm font-semibold text-ink">Availability</h3>
            <div className="overflow-hidden rounded-md border border-line">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-primary/5 text-ink">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Channel</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {item.availability.length > 0 ? (
                    item.availability.map((row, index) => (
                      <tr
                        key={row.outlet_channel_id}
                        className={`border-t border-line ${
                          index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                        }`}
                      >
                        <td className="px-3 py-2 text-ink">{row.channel_slug}</td>
                        <td
                          className={`px-3 py-2 font-medium ${
                            row.is_available ? 'text-success' : 'text-muted'
                          }`}
                        >
                          {row.is_available ? 'Available' : 'Unavailable'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-4 text-center text-sm text-muted"
                      >
                        No availability configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-line px-4 py-3">
            <h3 className="mb-3 text-sm font-semibold text-ink">Taxes</h3>
            <div className="overflow-hidden rounded-md border border-line">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-primary/5 text-ink">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Title</th>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {item.taxes.length > 0 ? (
                    item.taxes.map((tax, index) => (
                      <tr
                        key={tax.id}
                        className={`border-t border-line ${
                          index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                        }`}
                      >
                        <td className="px-3 py-2 text-ink">{tax.title}</td>
                        <td className="px-3 py-2 text-ink">{tax.tax_type}</td>
                        <td className="px-3 py-2 tabular-nums text-ink">
                          {tax.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-4 text-center text-sm text-muted"
                      >
                        No taxes configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}