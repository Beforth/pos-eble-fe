import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { AddonGroupForm } from '../components/menu/AddonGroupForm'
import { useAuth } from '../auth/AuthContext'
import {
  getAddonGroupApi,
  updateAddonGroupApi,
} from '../services/menuService'
import { showToast } from '../utils/toast'
import type { AddonGroup, AddonGroupPayload } from '../types/menu'

export default function EditAddonGroup() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()

  const [group, setGroup] = useState<AddonGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId || !id) {
      setLoading(false)
      setNotFound(true)
      return
    }
    getAddonGroupApi(encryptedOutletId, id)
      .then((data) => {
        if (cancelled) return
        setGroup(data)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoading(false)
        setNotFound(true)
        showToast(
          error instanceof Error ? error.message : 'Failed to load addon group',
        )
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, id])

  function goBack() {
    navigate('/menu/addons')
  }

  async function handleSave(payload: AddonGroupPayload) {
    if (!encryptedOutletId || !id) {
      showToast('No active outlet selected')
      return
    }
    setSaving(true)
    try {
      await updateAddonGroupApi(encryptedOutletId, id, payload)
      showToast('Addon group updated')
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update addon group',
      )
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = (
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
  )

  if (loading) {
    return (
      <MenuPageShell backTo="/menu/addons" title={pageTitle}>
        <div className="rounded-lg border border-line bg-card p-8 text-center">
          <p className="text-sm text-muted">Loading addon group...</p>
        </div>
      </MenuPageShell>
    )
  }

  if (notFound || !group) {
    return (
      <MenuPageShell backTo="/menu/addons" title={pageTitle}>
        <div className="rounded-lg border border-line bg-card p-8 text-center">
          <p className="text-sm font-semibold text-ink">
            Addon group not found
          </p>
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
      title={pageTitle}
    >
      <AddonGroupForm
        initial={group}
        saving={saving}
        onSubmit={handleSave}
        onCancel={goBack}
      />
    </MenuPageShell>
  )
}