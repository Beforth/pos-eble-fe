import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  getOutletSettingsApi,
  updateOutletSettingsApi,
  type OutletSettingsGroup,
  type OutletSettingsRecord,
} from './outletService'

/**
 * Load + save one outlet settings group (JSON body). Loads once per outlet /
 * group change and exposes an idempotent `save(payload)` that returns the
 * updated record as `data`.
 */
export function useOutletSettings(group: OutletSettingsGroup) {
  const { encryptedOutletId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OutletSettingsRecord | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    if (!encryptedOutletId) {
      setLoading(false)
      return
    }
    getOutletSettingsApi(encryptedOutletId, group)
      .then((value) => {
        if (!cancelled) setData(value)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Failed to load settings',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, group])

  async function save(payload: OutletSettingsRecord): Promise<void> {
    if (!encryptedOutletId) {
      throw new Error('No active outlet selected')
    }
    setSaving(true)
    try {
      const updated = await updateOutletSettingsApi(
        encryptedOutletId,
        group,
        payload,
      )
      setData(updated)
    } finally {
      setSaving(false)
    }
  }

  return { loading, saving, loadError, data, save }
}