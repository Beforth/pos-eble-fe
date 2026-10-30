import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Trash2, Upload, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useMenuChannels } from '../../state/MenuChannelsContext'
import { addItemImageApi, deleteItemImageApi } from '../../services/menuService'
import type { Item } from '../../types/menu'
import { showToast } from '../../utils/toast'

interface ItemImageModalProps {
  open: boolean
  item: Item | null
  onClose: () => void
  onSaved: () => void
}

export function ItemImageModal({
  open,
  item,
  onClose,
  onSaved,
}: ItemImageModalProps) {
  const { encryptedOutletId } = useAuth()
  const { channels } = useMenuChannels()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [channelId, setChannelId] = useState('')
  const [position, setPosition] = useState('0')
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!open || !item) return null

  async function handleUpload() {
    if (!imageFile || !encryptedOutletId || !item) return
    setUploading(true)
    try {
      await addItemImageApi(encryptedOutletId, item.id, {
        image: imageFile,
        outlet_channel_id: channelId || undefined,
        position: Number(position) || 0,
      })
      showToast('Image uploaded successfully')
      setImageFile(null)
      onSaved()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(imageId: string) {
    if (!encryptedOutletId) return
    setDeletingId(imageId)
    try {
      await deleteItemImageApi(encryptedOutletId, imageId)
      showToast('Image removed')
      onSaved()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove image')
    } finally {
      setDeletingId(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-image-modal-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2 id="item-image-modal-title" className="text-base font-semibold text-ink">
              Item Images
            </h2>
            <p className="text-xs text-muted">{item.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 space-y-4">
          {/* Existing Images */}
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Uploaded Images</p>
            {item.images.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-page/50 p-4 text-center text-xs text-muted">
                No images uploaded for this item yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {item.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-lg border border-line bg-page"
                  >
                    <img
                      src={img.image}
                      alt={item.name}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-1 p-2">
                      <span className="truncate text-[11px] font-medium text-muted">
                        {img.channel_slug ?? 'Base'}
                      </span>
                      <button
                        type="button"
                        disabled={deletingId === img.id}
                        onClick={() => handleDelete(img.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline disabled:opacity-50"
                      >
                        {deletingId === img.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Image Upload */}
          <div className="rounded-xl border border-line bg-page/50 p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Upload New Image</p>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">
                Select File
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-ink file:mr-3 file:h-8 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-card file:px-3 file:text-xs file:font-semibold file:text-ink hover:file:bg-page"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Channel
                </label>
                <select
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="h-8 w-full rounded-md border border-line bg-card px-2 text-xs text-ink outline-none focus:border-primary"
                >
                  <option value="">Base (All Channels)</option>
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.channel_label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Position
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="h-8 w-full rounded-md border border-line bg-card px-2 text-xs text-ink outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={uploading || !imageFile}
              onClick={handleUpload}
              className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-xs font-medium text-ink hover:bg-page"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
