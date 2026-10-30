import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { MenuItemForm } from '../components/menu/MenuItemForm'
import { useAuth } from '../auth/AuthContext'
import { useMenuChannels } from '../state/MenuChannelsContext'
import { useMenuReference } from '../state/MenuReferenceContext'
import { invalidateMenuItemCache } from '../state/menuItemsCache'
import { createItemApi } from '../services/menuService'
import { ApiError } from '../services/apiClient'
import { showToast } from '../utils/toast'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import type { ItemPayload } from '../types/menu'

const CHANNEL_SLUG_BY_ID: Record<string, string> = {
  'base-menu': 'base',
  'home-delivery': 'home-delivery',
  parcel: 'parcel',
  'dine-in': 'dine-in',
  zomato: 'zomato',
  swiggy: 'swiggy',
}

function mapServerErrors(errors: unknown): Record<string, string> {
  if (typeof errors !== 'object' || errors === null) return {}
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : String(value)
    if (message) next[key] = message
  }
  return next
}

export default function AddMenuItem() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultCategoryParam = searchParams.get('categoryId') ?? ''
  const { encryptedOutletId } = useAuth()
  const { channels } = useMenuChannels()

  const {
    categories,
    taxes,
    variationGroups,
    addonGroups,
    status: refStatus,
  } = useMenuReference(['categories', 'taxes', 'variationGroups', 'addonGroups'])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string>
  >({})

  const resolvedDefaultCategoryId =
    categories.length === 0
      ? ''
      : categories.some((category) => category.id === defaultCategoryParam)
        ? defaultCategoryParam
        : categories[0].id

  const loadFailed =
    refStatus.categories === 'error' ||
    refStatus.taxes === 'error' ||
    refStatus.variationGroups === 'error' ||
    refStatus.addonGroups === 'error'

  // `categories` is empty both while loading and when the outlet really has
  // none, so the status decides: an empty, finished load must not read as
  // "loading" forever (it left a brand-new outlet unable to add its first item).
  const categoriesLoading =
    refStatus.categories === 'idle' || refStatus.categories === 'loading'

  const prevLoadFailedRef = useRef(loadFailed)
  useEffect(() => {
    if (loadFailed && !prevLoadFailedRef.current) {
      showToast('Failed to load menu data')
    }
    prevLoadFailedRef.current = loadFailed
  }, [loadFailed])

  function goBack() {
    navigate('/menu/base-menu')
  }

  function handleSave(payload: ItemPayload) {
    if (!encryptedOutletId) {
      showToast('No outlet selected. Please switch to an outlet first.')
      return
    }
    setSaving(true)
    setSaveError('')
    setServerFieldErrors({})
    createItemApi(encryptedOutletId, payload)
      .then(() => {
        showToast('Item created successfully')
        invalidateMenuItemCache(encryptedOutletId, payload)
        window.setTimeout(() => navigate('/menu/base-menu'), 800)
      })
      .catch((error: unknown) => {
        setServerFieldErrors(
          error instanceof ApiError ? mapServerErrors(error.errors) : {},
        )
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Failed to create item. Please try again.',
        )
      })
      .finally(() => setSaving(false))
  }

  return (
    <MenuPageShell
      backTo="/menu/base-menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={goBack}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goBack()
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Menu Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Item</span>
        </span>
      }
    >
      {!encryptedOutletId ? (
        <p className="text-sm text-muted">
          No outlet selected. Please switch to an outlet from the header.
        </p>
      ) : loadFailed ? (
        <p className="text-sm text-muted">
          Could not load menu data. Check the API connection and try again.
        </p>
      ) : categoriesLoading ? (
        <p className="text-sm text-muted">Loading menu data…</p>
      ) : categories.length === 0 ? (
        <div className="max-w-md space-y-3">
          <p className="text-base font-semibold text-ink">No categories yet</p>
          <p className="text-sm text-muted">
            Every item belongs to a category, so add a category first and then
            come back to add the item.
          </p>
          <PrimaryButton onClick={() => navigate('/menu/categories/new')}>
            Add a category
          </PrimaryButton>
        </div>
      ) : (
        <MenuItemForm
          mode="create"
          categories={categories}
          taxes={taxes}
          variationGroups={variationGroups}
          addonGroups={addonGroups}
          channels={channels}
          currentChannelSlug={CHANNEL_SLUG_BY_ID['base-menu']}
          initialCategoryId={resolvedDefaultCategoryId}
          saving={saving}
          serverError={saveError}
          serverErrors={serverFieldErrors}
          uploadingImage={false}
          onSave={handleSave}
          onCancel={goBack}
        />
      )}
    </MenuPageShell>
  )
}