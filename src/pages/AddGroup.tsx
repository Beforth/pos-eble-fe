import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { useAuth } from '../auth/AuthContext'
import {
  createMenuGroupApi,
  listParentCategoriesApi,
} from '../services/menuService'
import type { ParentCategory } from '../types/menu'
import { showToast } from '../utils/toast'
import { useMenuReference } from '../state/MenuReferenceContext'

export default function AddGroup() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()

  const [name, setName] = useState('')
  const [sacCode, setSacCode] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [status, setStatus] = useState(true)
  const [parents, setParents] = useState<ParentCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  )
  const [saving, setSaving] = useState(false)

  const { categories, reload } = useMenuReference(['categories'])

  useEffect(() => {
    if (encryptedOutletId) void reload('categories', { force: true })
  }, [encryptedOutletId, reload])

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    listParentCategoriesApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setParents(rows)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : 'Failed to load parent categories',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  const categoryOptions = useMemo(
    () => categories.map((row) => ({ id: row.id, name: row.name })),
    [categories],
  )

  const allChecked =
    categoryOptions.length > 0 &&
    categoryOptions.every((item) => selectedCategories.has(item.id))

  function goBack() {
    navigate('/menu/categories?tab=grouping')
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCheckAll() {
    if (allChecked) {
      setSelectedCategories(new Set())
      return
    }
    setSelectedCategories(new Set(categoryOptions.map((item) => item.id)))
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast('Group name is required')
      return
    }
    if (selectedCategories.size === 0) {
      showToast('Select at least one category')
      return
    }
    if (!encryptedOutletId) {
      showToast('No outlet selected')
      return
    }

    setSaving(true)
    try {
      await createMenuGroupApi(
        encryptedOutletId,
        {
          name: name.trim(),
          sac_code: sacCode.trim(),
          parent_category_id: parentCategoryId || null,
          restaurant_name: restaurantName.trim(),
          header_text: headerText,
          footer_text: footerText,
          is_active: status,
          category_ids: Array.from(selectedCategories),
        },
        logoFile,
      )
      showToast('Group created')
      goBack()
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create group',
      )
    } finally {
      setSaving(false)
    }
  }

  const title = (
    <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
      <Link to="/menu" className="text-primary hover:underline">
        Menu
      </Link>
      <span className="font-normal text-muted">&gt;</span>
      <Link
        to="/menu/categories?tab=grouping"
        className="text-primary hover:underline"
      >
        Category Management
      </Link>
      <span className="font-normal text-muted">&gt;</span>
      <span className="font-semibold text-ink">Add Group</span>
    </span>
  )

  const fieldClass =
    'h-9 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink'
  const textareaClass =
    'min-h-28 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary'

  return (
    <MenuPageShell backTo="/menu/categories?tab=grouping" title={title}>
      <div className="rounded-lg border border-line bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-base font-bold text-ink">Add Group</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="group-name" className={labelClass}>
              Name <span className="text-primary">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="group-sac" className={labelClass}>
              SAC Code
            </label>
            <input
              id="group-sac"
              type="text"
              value={sacCode}
              onChange={(event) => setSacCode(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="group-parent" className={labelClass}>
              Parent Category
            </label>
            <select
              id="group-parent"
              value={parentCategoryId}
              onChange={(event) => setParentCategoryId(event.target.value)}
              className={fieldClass}
            >
              <option value="">Select Parent Category</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="mb-4 mt-8 text-base font-bold text-ink">
          Printer Settings
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="group-restaurant" className={labelClass}>
              Restaurant Name
            </label>
            <input
              id="group-restaurant"
              type="text"
              value={restaurantName}
              onChange={(event) => setRestaurantName(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="group-logo" className={labelClass}>
              Logo
            </label>
            <div className="flex h-9 items-center overflow-hidden rounded-md border border-line bg-card">
              <label
                htmlFor="group-logo"
                className="inline-flex h-full cursor-pointer items-center border-r border-line bg-page px-3 text-sm font-medium text-ink hover:bg-line/60"
              >
                Choose File
              </label>
              <span className="truncate px-3 text-sm text-muted">
                {logoFile?.name || 'No file chosen'}
              </span>
              <input
                id="group-logo"
                type="file"
                accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                className="sr-only"
                onChange={(event) =>
                  setLogoFile(event.target.files?.[0] ?? null)
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="group-header" className={labelClass}>
              Header Text
            </label>
            <textarea
              id="group-header"
              value={headerText}
              onChange={(event) => setHeaderText(event.target.value)}
              className={textareaClass}
            />
          </div>

          <div>
            <label htmlFor="group-footer" className={labelClass}>
              Footer Text
            </label>
            <textarea
              id="group-footer"
              value={footerText}
              onChange={(event) => setFooterText(event.target.value)}
              className={textareaClass}
            />
          </div>
        </div>

        <div className="mt-5">
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

        <div className="mt-8 rounded-md border border-line p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">
              Category <span className="text-primary">*</span>
            </h3>
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
            {categoryOptions.map((item) => {
              const checked = selectedCategories.has(item.id)
              return (
                <label
                  key={item.id}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(item.id)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {item.name}
                </label>
              )
            })}
          </div>
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-muted">No categories available.</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-line bg-primary/5 px-1 py-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
