import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { AddonGroupForm } from '../components/menu/AddonGroupForm'
import { useAuth } from '../auth/AuthContext'
import { createAddonGroupApi } from '../services/menuService'
import { showToast } from '../utils/toast'
import type { AddonGroupPayload } from '../types/menu'

export default function AddAddonGroup() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [saving, setSaving] = useState(false)

  function goBack() {
    navigate('/menu/addons')
  }

  async function handleSave(payload: AddonGroupPayload) {
    if (!encryptedOutletId) {
      showToast('No active outlet selected')
      return
    }
    setSaving(true)
    try {
      await createAddonGroupApi(encryptedOutletId, payload)
      showToast('Addon group created')
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create addon group',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <MenuPageShell
      backTo="/menu/addons"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/addons" className="text-primary hover:underline">
            Addon Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Addon Group</span>
        </span>
      }
    >
      <AddonGroupForm saving={saving} onSubmit={handleSave} onCancel={goBack} />
    </MenuPageShell>
  )
}
