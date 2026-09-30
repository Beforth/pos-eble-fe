import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { MenuItemForm } from '../components/menu/MenuItemForm'
import { useAuth } from '../auth/AuthContext'
import { useMenuChannels } from '../state/MenuChannelsContext'
import { useMenuReference } from '../state/MenuReferenceContext'
import {
  addItemImageApi,
  deleteItemImageApi,
  getItemApi,
  updateItemApi,
} from '../services/menuService'
import { ApiError } from '../services/apiClient'
import { showToast } from '../utils/toast'
import {
  isMenuChannelId,
  MENU_CHANNELS,
} from '../mocks/menuChannels'
import type { Item, ItemImage, ItemPayload } from '../types/menu'
import { ConfirmDialog } from '../components/common/ConfirmDialog'

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

export default function EditMenuItem() {
  const { id = '', channel: channelParam } = useParams()
  const rawChannel = channelParam ?? ''
  const channelId = isMenuChannelId(rawChannel) ? rawChannel : 'base-menu'
  const channel = MENU_CHANNELS[channelId]
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const { channels, status: channelsStatus } = useMenuChannels()
  const { categories, taxes, variationGroups, addonGroups } = useMenuReference([
    'categories',
    'taxes',
    'variationGroups',
    'addonGroups',
  ])

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string>
  >({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [pendingImageDelete, setPendingImageDelete] = useState<ItemImage | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) {
      setLoading(false)
      setLoadError('No outlet selected. Please switch to an outlet first.')
      return
    }

    setLoading(true)
    setLoadError('')
    getItemApi(encryptedOutletId, id)
      .then((data) => {
        if (!cancelled) setItem(data)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Item could not be loaded. Please try again.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, id])

  function goBack() {
    navigate(channel.path)
  }

  function handleSave(payload: ItemPayload) {
    if (!encryptedOutletId || !item) return
    setSaving(true)
    setSaveError('')
    setServerFieldErrors({})
    updateItemApi(encryptedOutletId, item.id, payload)
      .then((updated) => {
        setItem(updated)
        showToast('Item updated successfully')
        window.setTimeout(() => navigate(channel.path), 800)
      })
      .catch((error: unknown) => {
        setServerFieldErrors(
          error instanceof ApiError ? mapServerErrors(error.errors) : {},
        )
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Failed to update item. Please try again.',
        )
      })
      .finally(() => setSaving(false))
  }

  async function refreshItem() {
    if (!encryptedOutletId || !item) return
    const refreshed = await getItemApi(encryptedOutletId, item.id)
    setItem(refreshed)
  }

  function handleUploadImage({
    image,
    outlet_channel_id,
    position,
  }: {
    image: File
    outlet_channel_id?: string
    position?: number
  }) {
    if (!encryptedOutletId || !item) return
    setUploadingImage(true)
    addItemImageApi(encryptedOutletId, item.id, {
      image,
      outlet_channel_id,
      position,
    })
      .then(async () => {
        showToast('Image uploaded successfully')
        await refreshItem()
      })
      .catch((error: unknown) => {
        showToast(
          error instanceof Error ? error.message : 'Image upload failed',
        )
      })
      .finally(() => setUploadingImage(false))
  }

  function handleDeleteImage(imageId: string) {
    if (!encryptedOutletId || !item) return
    const image = item.images.find((entry) => entry.id === imageId)
    if (image) {
      setPendingImageDelete(image)
      return
    }
    void removeImage(imageId)
  }

  async function removeImage(imageId: string) {
    if (!encryptedOutletId || !item) return
    deleteItemImageApi(encryptedOutletId, imageId)
      .then(async () => {
        showToast('Image removed')
        await refreshItem()
      })
      .catch((error: unknown) => {
        showToast(
          error instanceof Error ? error.message : 'Failed to remove image',
        )
      })
  }

  async function confirmDeleteImage() {
    if (!pendingImageDelete) return
    const image = pendingImageDelete
    setPendingImageDelete(null)
    await removeImage(image.id)
  }

  const loadingChannels = channelsStatus === 'loading' && channels.length === 0

  return (
    <MenuPageShell
      backTo={channel.path}
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to={channel.path} className="text-primary hover:underline">
            {channel.label}
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">
            Edit {item?.name ?? 'Item'}
          </span>
        </span>
      }
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading item…</p>
      ) : loadError ? (
        <div className="space-y-3 rounded-lg border border-line bg-card p-6">
          <p className="text-sm font-medium text-ink">
            Item not found or could not be loaded.
          </p>
          <p className="text-sm text-muted">{loadError}</p>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Go back
          </button>
        </div>
      ) : !item ? (
        <p className="text-sm text-muted">Item unavailable.</p>
      ) : loadingChannels ? (
        <p className="text-sm text-muted">Loading channels…</p>
      ) : (
        <MenuItemForm
          mode="edit"
          categories={categories}
          taxes={taxes}
          variationGroups={variationGroups}
          addonGroups={addonGroups}
          channels={channels}
          currentChannelSlug={CHANNEL_SLUG_BY_ID[channelId] ?? channelId}
          item={item}
          saving={saving}
          serverError={saveError}
          serverErrors={serverFieldErrors}
          uploadingImage={uploadingImage}
          onSave={handleSave}
          onCancel={goBack}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingImageDelete)}
        title="Remove item image"
        target={pendingImageDelete?.channel_slug ?? 'Base menu'}
        message={`This image will be detached from “${item?.name ?? 'this item'}” on the ${pendingImageDelete?.channel_slug ?? 'base menu'} channel.`}
        consequences={[
          'The item keeps its name, price and other images.',
          'This channel falls back to its default image until you upload a new one.',
        ]}
        note="The image file itself stays in outlet media storage — this only detaches it from the item, so the item is not permanently changed."
        confirmLabel="Remove image"
        onConfirm={() => void confirmDeleteImage()}
        onClose={() => setPendingImageDelete(null)}
      />
    </MenuPageShell>
  )
}