import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { OTHER_PAYMENT_TYPES } from '../components/billing/OtherPaymentModal'
import { getOutletSettingsApi } from './outletService'

/** Payment types billing already has a button for; the rest go under "Other". */
const BUILT_IN = new Set(['cash', 'card', 'due', 'part payment', 'part', 'other', 'not paid'])

const CACHE_MS = 30_000

interface PaymentChoices {
  /** Enabled payment types and UPI providers beyond the built-in buttons. */
  other: string[]
  /** Enabled card options (the bank or card type) for the Card payment. */
  cards: string[]
}

const cache = new Map<string, { value: PaymentChoices; at: number }>()
const inflight = new Map<string, Promise<PaymentChoices>>()

async function loadChoices(outletId: string): Promise<PaymentChoices> {
  const hit = cache.get(outletId)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value
  const pending = inflight.get(outletId)
  if (pending) return pending
  const request = getOutletSettingsApi(outletId, 'payment')
    .then((data) => {
      const rows = (key: string) =>
        Array.isArray(data[key]) ? (data[key] as Array<Record<string, unknown>>) : []
      const types = [...rows('payment_types')]
        .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
        .filter((row) => Boolean(row.is_enabled))
        .map((row) => String(row.name))
        .filter((name) => !BUILT_IN.has(name.trim().toLowerCase()))
      // A UPI provider shows under its custom name, like "UPI - Test".
      const providers = rows('upi_providers')
        .map((row) => {
          const custom = String(row.custom_name ?? '').trim()
          const provider = String(row.provider ?? '').trim()
          return custom && custom.toLowerCase() !== provider.toLowerCase()
            ? `${provider} - ${custom}`
            : provider
        })
        .filter(Boolean)
      const cards = rows('card_options')
        .filter((row) => Boolean(row.is_enabled))
        .map((row) => String(row.name))
      const value = { other: [...types, ...providers], cards }
      cache.set(outletId, { value, at: Date.now() })
      return value
    })
    .finally(() => inflight.delete(outletId))
  inflight.set(outletId, request)
  return request
}

/** The outlet's payment choices from Outlet Configuration > Payment, kept fresh. */
function usePaymentChoices(): PaymentChoices {
  const { encryptedOutletId } = useAuth()
  const [choices, setChoices] = useState<PaymentChoices>(
    () =>
      (encryptedOutletId ? cache.get(encryptedOutletId)?.value : undefined) ?? {
        other: [],
        cards: [],
      },
  )

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    loadChoices(encryptedOutletId)
      .then((value) => {
        if (!cancelled) setChoices(value)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  return choices
}

/**
 * The choices for billing's "Other" payment: payment types and UPI providers
 * the outlet added and enabled under Outlet Configuration > Payment, ahead of
 * the standard wallets and apps.
 */
export function usePaymentTypeOptions(): string[] {
  const { other } = usePaymentChoices()
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of [...other, ...OTHER_PAYMENT_TYPES]) {
    const key = name.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(name.trim())
  }
  return out
}

/** The enabled card options (HDFC ...) offered when the payment is Card. */
export function usePaymentCardOptions(): string[] {
  return usePaymentChoices().cards
}
