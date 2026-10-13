import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileText, FolderOpen, Plus, Trash2, X } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { UploadPhysicalMenuModal } from '../components/menu/UploadPhysicalMenuModal'
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal'
import { deletePhysicalMenuApi, getPhysicalMenuApi } from '../services/menuService'
import type { PhysicalMenu } from '../types/menu'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'

function formatUploadedAt(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PhysicalMenu() {
  const { encryptedOutletId } = useAuth()
  const [menu, setMenu] = useState<PhysicalMenu | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    setLoading(true)
    getPhysicalMenuApi(encryptedOutletId)
      .then((result) => {
        if (!cancelled) setMenu(result)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : 'Failed to load physical menu',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  function refresh() {
    if (!encryptedOutletId) return
    getPhysicalMenuApi(encryptedOutletId)
      .then((result) => setMenu(result))
      .catch((error: unknown) => {
        showToast(
          error instanceof Error
            ? error.message
            : 'Failed to load physical menu',
        )
      })
  }

  async function handleDelete() {
    if (!encryptedOutletId) return
    try {
      await deletePhysicalMenuApi(encryptedOutletId)
      showToast('Physical menu deleted')
      refresh()
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to delete physical menu',
      )
    }
  }

  return (
    <MenuPageShell
      backTo="/menu"
      activeItem="physical-menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Physical Menu</span>
        </span>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink sm:text-lg">
          Here Are All The Menus That You Have Uploaded
        </h2>
        <PrimaryButton onClick={() => setUploadOpen(true)}>
          <Plus size={15} />
          Add File
        </PrimaryButton>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm text-muted">Loading...</p>
          </div>
        ) : menu ? (
          <ul className="divide-y divide-line">
            <li className="flex items-center gap-3 px-4 py-3.5 hover:bg-page/60">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText size={18} />
              </span>
              <div className="min-w-0 flex-1">
                {menu.url ? (
                  <a
                    href={menu.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-semibold text-primary hover:underline"
                  >
                    {menu.url}
                  </a>
                ) : (
                  <p className="truncate text-sm font-semibold text-ink">
                    Physical Menu
                  </p>
                )}
                <p className="text-xs text-muted">
                  Uploaded {formatUploadedAt(menu.uploaded_at)}
                </p>
              </div>
              {menu.url ? (
                <a
                  href={menu.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                  aria-label="View physical menu"
                  data-tooltip="View physical menu"
                  title="View physical menu"
                >
                  <Eye size={16} />
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                aria-label="Delete physical menu"
                data-tooltip="Delete physical menu"
              >
                <Trash2 size={15} />
              </button>
            </li>
          </ul>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="relative mb-5 text-muted">
              <FolderOpen
                size={72}
                strokeWidth={1.25}
                className="text-muted/70"
              />
              <span className="absolute -bottom-1 -left-2 flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-white">
                <X size={14} strokeWidth={3} />
              </span>
            </span>
            <p className="text-base font-semibold text-ink">No Record Found</p>
          </div>
        )}
      </div>

      <UploadPhysicalMenuModal
        open={uploadOpen}
        encryptedOutletId={encryptedOutletId ?? ''}
        onClose={() => setUploadOpen(false)}
        onUploaded={refresh}
      />

      <ConfirmDeleteModal
        open={confirmDelete}
        title="Delete physical menu"
        message="The uploaded menu file will be removed from outlet storage."
        consequences={[
          'The physical menu stops being available to print or share.',
          'The menu record itself is archived, not erased.',
        ]}
        note="The file is permanently deleted and cannot be recovered — only the record stays behind."
        confirmLabel="Delete"
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmDelete(false)}
      />
    </MenuPageShell>
  )
}