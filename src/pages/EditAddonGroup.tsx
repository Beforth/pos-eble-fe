import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Info,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { getAddonGroupById } from '../mocks/menuSectionData'

type Attribute = 'veg' | 'non-veg' | 'egg'

interface AddonItemRow {
  id: string
  eid: string
  name: string
  price: string
  sapCode: string
  attribute: Attribute
  available: 'Active' | 'Inactive'
}

function createItem(name = '', price = '0'): AddonItemRow {
  const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  return {
    id,
    eid: `A${Math.floor(10000000 + Math.random() * 89999999)}`,
    name,
    price,
    sapCode: '',
    attribute: 'veg',
    available: 'Active',
  }
}

export default function EditAddonGroup() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const group = useMemo(() => getAddonGroupById(id), [id])

  const [departmentName, setDepartmentName] = useState(
    group?.departmentName ?? '',
  )
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    group?.onlineDisplayName ?? '',
  )
  const [addonMin, setAddonMin] = useState('0')
  const [addonMax, setAddonMax] = useState('1')
  const [selectionType, setSelectionType] = useState('single')
  const [maxPerAddon, setMaxPerAddon] = useState('')
  const [showOnline, setShowOnline] = useState(true)
  const [showDineInQr, setShowDineInQr] = useState(true)
  const [status, setStatus] = useState(true)
  const [showPos, setShowPos] = useState(true)
  const [showCaptain, setShowCaptain] = useState(true)
  const [allowOpenQty, setAllowOpenQty] = useState(false)
  const [items, setItems] = useState<AddonItemRow[]>(() => [
    createItem(
      group?.departmentName === 'Cheese' ? 'Extra Cheese' : 'New Addon',
      group?.departmentName === 'Cheese' ? '20' : '0',
    ),
  ])

  function goBack() {
    navigate('/menu/addons')
  }

  function updateItem(itemId: string, patch: Partial<AddonItemRow>) {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    )
  }

  if (!group) {
    return (
      <MenuPageShell
        backTo="/menu/addons"
        title={
          <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
            <Link to="/menu" className="text-primary hover:underline">
              Menu Management
            </Link>
            <span className="font-normal text-muted">&gt;</span>
            <Link to="/menu/addons" className="text-primary hover:underline">
              Addon Management
            </Link>
            <span className="font-normal text-muted">&gt;</span>
            <span className="font-semibold text-ink">Edit Addon Group</span>
          </span>
        }
      >
        <div className="rounded-lg border border-line bg-card p-8 text-center">
          <p className="text-sm font-semibold text-ink">Addon group not found</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-md border border-primary px-4 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Back to Addons
          </button>
        </div>
      </MenuPageShell>
    )
  }

  return (
    <MenuPageShell
      backTo="/menu/addons"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/addons" className="text-primary hover:underline">
            Addon Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Edit Addon Group</span>
        </span>
      }
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-base font-bold text-ink">Department Details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Department Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Online Display Name
              </label>
              <input
                type="text"
                value={onlineDisplayName}
                onChange={(event) => setOnlineDisplayName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Addon Min
              </label>
              <input
                type="number"
                value={addonMin}
                onChange={(event) => setAddonMin(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Addon Max
              </label>
              <input
                type="number"
                value={addonMax}
                onChange={(event) => setAddonMax(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Addon Item Selection
              </label>
              <div className="relative">
                <select
                  value={selectionType}
                  onChange={(event) => setSelectionType(event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
                >
                  <option value="single">Allow Single Selection</option>
                  <option value="multiple">Allow Multiple Selection</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
              <p className="mt-1 text-xs text-muted">Used only for POS</p>
            </div>
            <div>
              <label className="mb-1.5 inline-flex items-center gap-1 text-sm font-medium text-ink">
                Max Selection Per Addon Allowed
                <Info size={13} className="text-muted" />
              </label>
              <input
                type="text"
                value={maxPerAddon}
                onChange={(event) => setMaxPerAddon(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-muted">Used only for zomato</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {(
              [
                ['Show in Online', showOnline, setShowOnline],
                ['Show in DineIn QR', showDineInQr, setShowDineInQr],
                ['Status', status, setStatus],
                ['Show in POS', showPos, setShowPos],
                ['Show in Captain', showCaptain, setShowCaptain],
                ['Allow Open Quantity', allowOpenQty, setAllowOpenQty],
              ] as const
            ).map(([label, checked, setter]) => (
              <label
                key={label}
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => setter(event.target.checked)}
                  className="size-4 cursor-pointer accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-base font-bold text-ink">
            Addon Group Item Details
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-3 normal-case text-ink">
                    Department Name
                  </th>
                  <th className="px-3 py-3 normal-case text-ink">
                    Price <span className="text-primary">*</span>
                  </th>
                  <th className="px-3 py-3 normal-case text-ink">
                    <span className="inline-flex items-center gap-1">
                      Sap Code
                      <Info size={12} className="text-muted" />
                    </span>
                  </th>
                  <th className="px-3 py-3 normal-case text-ink">Attributes</th>
                  <th className="px-3 py-3 normal-case text-ink">Available</th>
                  <th className="px-3 py-3 normal-case text-ink">IMAGE</th>
                  <th className="px-3 py-3 normal-case text-ink">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-line">
                    <td className="px-3 py-3 align-top">
                      <p className="mb-1 text-[11px] text-muted">
                        EID: {item.eid}
                      </p>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(event) =>
                          updateItem(item.id, { name: event.target.value })
                        }
                        className="h-9 w-full min-w-[140px] rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <input
                        type="text"
                        value={item.price}
                        onChange={(event) =>
                          updateItem(item.id, { price: event.target.value })
                        }
                        className="h-9 w-24 rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <input
                        type="text"
                        value={item.sapCode}
                        onChange={(event) =>
                          updateItem(item.id, { sapCode: event.target.value })
                        }
                        className="h-9 w-28 rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-3">
                        {(
                          [
                            ['veg', 'Veg'],
                            ['non-veg', 'Non Veg'],
                            ['egg', 'Egg'],
                          ] as const
                        ).map(([value, label]) => (
                          <label
                            key={value}
                            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink"
                          >
                            <input
                              type="radio"
                              name={`attr-${item.id}`}
                              checked={item.attribute === value}
                              onChange={() =>
                                updateItem(item.id, { attribute: value })
                              }
                              className="accent-primary"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                        {item.available}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        aria-label="Upload image"
                        className="cursor-pointer rounded p-1.5 text-muted hover:bg-page hover:text-ink"
                      >
                        <Upload size={16} />
                      </button>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Delete item"
                          onClick={() =>
                            setItems((prev) =>
                              prev.filter((row) => row.id !== item.id),
                            )
                          }
                          className="cursor-pointer rounded p-1.5 text-muted hover:bg-page hover:text-ink"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Show changes"
                          className="cursor-pointer rounded p-1.5 text-muted hover:bg-page hover:text-ink"
                        >
                          <ClipboardList size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, createItem()])}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              <Plus size={15} />
              Add New
            </button>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
