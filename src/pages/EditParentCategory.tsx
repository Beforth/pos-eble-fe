import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ASSIGNABLE_CATEGORIES,
  getParentCategoryById,
} from '../mocks/parentCategoriesData'

export default function EditParentCategory() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const parent = useMemo(() => getParentCategoryById(id), [id])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([
      ...ASSIGNABLE_CATEGORIES,
      ...(parent?.categoryIds ?? []),
    ])
    return Array.from(set)
  }, [parent])

  const [name, setName] = useState(parent?.name ?? '')
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    parent?.onlineDisplayName ?? '',
  )
  const [status, setStatus] = useState(parent?.status === 'Active')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(parent?.categoryIds ?? []),
  )
  const [logoName, setLogoName] = useState('')
  const [swiggyImageName, setSwiggyImageName] = useState('')

  const allChecked =
    categoryOptions.length > 0 &&
    categoryOptions.every((item) => selectedCategories.has(item))

  function goBack() {
    navigate('/menu/categories?tab=parent')
  }

  function toggleCategory(label: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  function toggleCheckAll() {
    if (allChecked) {
      setSelectedCategories(new Set())
      return
    }
    setSelectedCategories(new Set(categoryOptions))
  }

  if (!parent) {
    return (
      <MenuPageShell
        backTo="/menu/categories?tab=parent"
        title={
          <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
            <Link to="/menu" className="text-primary hover:underline">
              Menu Management
            </Link>
            <span className="font-normal text-muted">&gt;</span>
            <Link
              to="/menu/categories?tab=parent"
              className="text-primary hover:underline"
            >
              Category Management
            </Link>
            <span className="font-normal text-muted">&gt;</span>
            <span className="font-semibold text-ink">Edit Parent Category</span>
          </span>
        }
      >
        <div className="rounded-lg border border-line bg-card p-8 text-center">
          <p className="text-sm font-semibold text-ink">Parent category not found</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-md border border-primary px-4 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Back to Parent Categories
          </button>
        </div>
      </MenuPageShell>
    )
  }

  return (
    <MenuPageShell
      backTo="/menu/categories?tab=parent"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link
            to="/menu/categories?tab=parent"
            className="text-primary hover:underline"
          >
            Category Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Edit Parent Category</span>
        </span>
      }
    >
      <div className="rounded-lg border border-line bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-base font-bold text-ink">Edit Parent Category</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="parent-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Name <span className="text-primary">*</span>
            </label>
            <input
              id="parent-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="parent-online-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Online Display Name
            </label>
            <input
              id="parent-online-name"
              type="text"
              value={onlineDisplayName}
              onChange={(event) => setOnlineDisplayName(event.target.value)}
              className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="parent-logo"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Logo
            </label>
            <div className="flex h-9 items-center overflow-hidden rounded-md border border-line bg-card">
              <label
                htmlFor="parent-logo"
                className="inline-flex h-full cursor-pointer items-center border-r border-line bg-page px-3 text-sm font-medium text-ink hover:bg-line/60"
              >
                Choose File
              </label>
              <span className="truncate px-3 text-sm text-muted">
                {logoName || 'No file chosen'}
              </span>
              <input
                id="parent-logo"
                type="file"
                accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                className="sr-only"
                onChange={(event) =>
                  setLogoName(event.target.files?.[0]?.name ?? '')
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Upload only png, jpeg or jpg file
            </p>
          </div>

          <div>
            <label
              htmlFor="parent-swiggy-image"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Swiggy Image
            </label>
            <div className="flex h-9 items-center overflow-hidden rounded-md border border-line bg-card">
              <label
                htmlFor="parent-swiggy-image"
                className="inline-flex h-full cursor-pointer items-center border-r border-line bg-page px-3 text-sm font-medium text-ink hover:bg-line/60"
              >
                Choose File
              </label>
              <span className="truncate px-3 text-sm text-muted">
                {swiggyImageName || 'No file chosen'}
              </span>
              <input
                id="parent-swiggy-image"
                type="file"
                accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                className="sr-only"
                onChange={(event) =>
                  setSwiggyImageName(event.target.files?.[0]?.name ?? '')
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Upload only png, jpeg or jpg file
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">
              Parent Category Schedule
            </h3>
            <button
              type="button"
              className="inline-flex h-9 cursor-pointer items-center rounded-md border border-primary px-3 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Add Schedule
            </button>
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

        <div className="mt-8 border-t border-line pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Category</h3>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleCheckAll}
                className="size-4 cursor-pointer accent-primary"
              />
              Check All
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryOptions.map((label) => {
              const checked = selectedCategories.has(label)
              return (
                <label
                  key={label}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(label)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {label}
                </label>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
