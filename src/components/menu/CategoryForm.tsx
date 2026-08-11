import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CategoryFormValues {
  name: string
  onlineDisplayName: string
  tag: string
  status: boolean
  logoName: string
  swiggyImageName: string
  offlineImageName: string
}

interface CategoryFormProps {
  title: string
  initial: CategoryFormValues
  onCancel: () => void
  onSave: (values: CategoryFormValues) => void
  headerActions?: ReactNode
}

const TAG_OPTIONS = [
  'Popular',
  'Veg',
  'Best Seller',
  'New',
  'Combo',
  'Seasonal',
]

function FileField({
  id,
  label,
  fileName,
  onChange,
}: {
  id: string
  label: string
  fileName: string
  onChange: (name: string) => void
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <label
        htmlFor={id}
        className="flex h-10 w-full cursor-pointer items-center overflow-hidden rounded-md border border-line bg-card transition-colors hover:border-muted"
      >
        <span className="inline-flex h-full shrink-0 items-center border-r border-line bg-page px-3 text-sm font-medium text-ink">
          Choose File
        </span>
        <span className="min-w-0 flex-1 truncate px-3 text-sm text-muted">
          {fileName || 'No file chosen'}
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept=".png,.jpeg,.jpg,image/png,image/jpeg"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0]?.name ?? '')}
      />
      <p className="mt-1 text-xs text-muted">
        Upload only png, jpeg or jpg file
      </p>
    </div>
  )
}

export function CategoryForm({
  title,
  initial,
  onCancel,
  onSave,
  headerActions,
}: CategoryFormProps) {
  const [name, setName] = useState(initial.name)
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    initial.onlineDisplayName,
  )
  const [tag, setTag] = useState(initial.tag)
  const [status, setStatus] = useState(initial.status)
  const [logoName, setLogoName] = useState(initial.logoName)
  const [swiggyImageName, setSwiggyImageName] = useState(initial.swiggyImageName)
  const [offlineImageName, setOfflineImageName] = useState(
    initial.offlineImageName,
  )

  function handleSave() {
    onSave({
      name: name.trim(),
      onlineDisplayName: onlineDisplayName.trim(),
      tag,
      status,
      logoName,
      swiggyImageName,
      offlineImageName,
    })
  }

  return (
    <div className="w-full rounded-lg border border-line bg-card p-5 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {headerActions}
      </div>

      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="category-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Name <span className="text-primary">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="category-online-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Online Display Name
            </label>
            <input
              id="category-online-name"
              type="text"
              value={onlineDisplayName}
              onChange={(event) => setOnlineDisplayName(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category-tag"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Select Tag
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <select
                id="category-tag"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-line bg-card px-3 pr-9 text-sm text-ink outline-none focus:border-primary"
              >
                <option value="">Select Tag</option>
                {TAG_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Add Tag
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <FileField
            id="category-logo"
            label="Logo"
            fileName={logoName}
            onChange={setLogoName}
          />
          <FileField
            id="category-swiggy-image"
            label="Swiggy Image"
            fileName={swiggyImageName}
            onChange={setSwiggyImageName}
          />
          <FileField
            id="category-offline-image"
            label="Offline Orders Image"
            fileName={offlineImageName}
            onChange={setOfflineImageName}
          />
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={status}
            onChange={(event) => setStatus(event.target.checked)}
            className="size-4 cursor-pointer accent-primary"
          />
          Status
        </label>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
