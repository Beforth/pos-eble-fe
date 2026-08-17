import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MonitorSmartphone, Plus } from 'lucide-react'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { CreateScreenModal } from '../../components/screens/CreateScreenModal'
import { EditScreenModal } from '../../components/screens/EditScreenModal'
import { ScreenCard } from '../../components/screens/ScreenCard'
import type { KotScreen } from '../../mocks/screensData'
import { fetchScreens, removeScreen } from '../../services/screenService'
import { brand } from '../../theme/brand'

export default function ScreenManager() {
  const navigate = useNavigate()
  const [screens, setScreens] = useState<KotScreen[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingScreen, setEditingScreen] = useState<KotScreen | null>(null)
  const [pendingDelete, setPendingDelete] = useState<KotScreen | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(() => {
    fetchScreens()
      .then(setScreens)
      .catch(() => setScreens([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  function handleCreated(screen: KotScreen) {
    setCreateOpen(false)
    setScreens((prev) => [screen, ...prev])
    navigate(`/screens/${screen.id}`)
  }

  function handleSaved(updated: KotScreen) {
    setEditingScreen(null)
    setScreens((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row)),
    )
    setToast(`"${updated.name}" updated`)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    await removeScreen(pendingDelete.id)
    setScreens((prev) => prev.filter((row) => row.id !== pendingDelete.id))
    setToast(`"${pendingDelete.name}" deleted`)
    setPendingDelete(null)
  }

  return (
    <div className="min-h-screen bg-page">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <CreateScreenModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <EditScreenModal
        open={Boolean(editingScreen)}
        screen={editingScreen}
        onClose={() => setEditingScreen(null)}
        onSaved={handleSaved}
      />

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete Screen"
        message={`Delete "${pendingDelete?.name}"? This screen will stop showing KOTs.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo size={34} />
          <div>
            <p className="text-sm font-bold leading-tight text-ink">
              {brand.outletName}
            </p>
            <p className="text-xs text-muted">KOT Display Screens</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink sm:text-xl">KOT Screens</h1>
            <p className="mt-0.5 text-sm text-muted">
              Each screen shows KOTs only for the categories you pick — e.g. a
              Pizza screen shows only pizza KOTs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={17} />
            Create Screen
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
            Loading screens…
          </div>
        ) : screens.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-card px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MonitorSmartphone size={26} />
            </span>
            <p className="text-base font-semibold text-ink">
              No screens yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Create your first KOT screen — pick the categories you want, and
              the screen will show only those KOTs.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Plus size={17} />
              Create Screen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {screens.map((screen) => (
              <ScreenCard
                key={screen.id}
                screen={screen}
                onOpen={(entry) => navigate(`/screens/${entry.id}`)}
                onEdit={setEditingScreen}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
