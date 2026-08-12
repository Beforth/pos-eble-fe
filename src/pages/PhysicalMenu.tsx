import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FolderOpen, Plus, X } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { UploadPhysicalMenuModal } from '../components/menu/UploadPhysicalMenuModal'

interface PhysicalMenuFile {
  id: string
  name: string
  size: number
  uploadedAt: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PhysicalMenu() {
  const [files, setFiles] = useState<PhysicalMenuFile[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)

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
        {files.length === 0 ? (
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
        ) : (
          <ul className="divide-y divide-line">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-page/60"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted">
                    {formatSize(file.size)} · {file.uploadedAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((f) => f.id !== file.id))
                  }
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-primary/10 hover:text-primary"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UploadPhysicalMenuModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={(selected) => {
          const uploadedAt = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          setFiles((prev) => [
            ...selected.map((file, index) => ({
              id: `pm-${Date.now()}-${index}`,
              name: file.name,
              size: file.size,
              uploadedAt,
            })),
            ...prev,
          ])
        }}
      />
    </MenuPageShell>
  )
}
