import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { brand } from '../../theme/brand'

export type LegalDocKind = 'terms' | 'privacy'

interface Section {
  heading: string
  paragraphs: string[]
}

const LAST_UPDATED = '17 Aug 2026'

const TERMS: Section[] = [
  {
    heading: '1. Acceptance of terms',
    paragraphs: [
      `These Terms & Conditions govern use of the ${brand.shortName} POS (“the Software”) at ${brand.outletName} and any other authorised outlets. By signing in, you agree to follow these terms and the outlet’s operating policies.`,
      'If you do not agree, you must not access the Software. Continued use after an update means you accept the revised terms.',
    ],
  },
  {
    heading: '2. Licence and permitted use',
    paragraphs: [
      `The Software is licensed to ${brand.shopName} for restaurant operations: billing, KOT, table management, online orders, inventory, reports, and related configuration.`,
      'You may use the Software only for authorised outlet work. You must not copy, reverse-engineer, resell, or share access with anyone who is not a registered user.',
    ],
  },
  {
    heading: '3. User accounts and access',
    paragraphs: [
      'Each staff member must use their own login, passcode, or swipe code. Sharing credentials is not allowed.',
      'Outlet admins assign roles (billing, captain, waiter, delivery, and others) and permissions. You are responsible for actions taken under your account, including discounts, complimentary items, cancelled KOTs, reprinted bills, and due settlements.',
    ],
  },
  {
    heading: '4. Orders, billing, and payments',
    paragraphs: [
      'Bills, KOTs, and settlements generated in the Software are records of outlet transactions. Staff must enter items, quantities, taxes, discounts, and payment modes accurately.',
      'Cash, UPI, card, due, and aggregator collections must match the payment recorded on the bill. Due payments remain the outlet’s responsibility until settled.',
      'Cancelled, modified, or waived bills must follow outlet policy. Misuse of complimentary, NC, or leakage functions may lead to access being withdrawn.',
    ],
  },
  {
    heading: '5. Menu, inventory, and reports',
    paragraphs: [
      'Menu prices, taxes, recipes, and stock figures shown in the Software are for operations. The outlet is responsible for keeping them current.',
      'Reports (sales, item performance, leakage, expenses, and others) are generated from data entered in the POS. They do not replace statutory books of account.',
    ],
  },
  {
    heading: '6. Online platforms',
    paragraphs: [
      'Orders from Swiggy, Zomato, and other connected services appear in the POS as received from those platforms. Acceptance, rejection, and rider handover follow aggregator rules as well as these terms.',
      `${brand.shortName} is not responsible for platform downtime, commission changes, or customer disputes raised on those apps.`,
    ],
  },
  {
    heading: '7. Availability and updates',
    paragraphs: [
      `The Software is provided as-is for outlet use. We may update features, printers, tax printing, and configuration from time to time. Version ${brand.appVersion} is the current release.`,
      'The outlet should keep devices, printers, and network in working order. Temporary unavailability (sync delay, printer fault, or internet outage) does not cancel these terms.',
    ],
  },
  {
    heading: '8. Liability',
    paragraphs: [
      'To the extent permitted by law, the Software provider is not liable for lost sales, tax filings, stock variance, or disputes arising from incorrect data entry, hardware failure, or third-party platforms.',
      'The outlet remains responsible for GST, FSSAI, labour, and other statutory compliance.',
    ],
  },
  {
    heading: '9. Contact',
    paragraphs: [
      `Questions about these terms can be raised through Support Agent in the POS or with the outlet point of contact for ${brand.shortName}.`,
    ],
  },
]

const PRIVACY: Section[] = [
  {
    heading: '1. Scope',
    paragraphs: [
      `This Privacy Policy explains how ${brand.shopName} (“we”, “the outlet”) handles information collected through the ${brand.shortName} POS at ${brand.outletName}.`,
      'It covers staff accounts, customer details used for billing, and operational records generated while using the Software.',
    ],
  },
  {
    heading: '2. Information we collect',
    paragraphs: [
      'Staff: name, username, email, mobile number, role, permissions, login activity, and optional profile photo.',
      'Customers: name, phone, address (for delivery), order history, due balances, and loyalty or discount notes when entered at billing.',
      'Operations: orders, KOTs, bills, payment mode, table occupancy, inventory movements, expenses, and report exports.',
      'Devices: outlet, screen, printer, and sync status needed to run billing and KOT printing.',
    ],
  },
  {
    heading: '3. How we use information',
    paragraphs: [
      'To take orders, print KOTs and bills, settle payments, and manage tables.',
      'To sync online orders, inventory, and day-end reports.',
      'To control access by role and to review leakage (cancelled KOTs, modified bills, reprints).',
      'To contact customers for delivery, due collection, or order issues when a number is saved.',
    ],
  },
  {
    heading: '4. Sharing',
    paragraphs: [
      'We do not sell customer or staff data.',
      'Order and payment details may be shared with connected services the outlet has enabled (for example Swiggy, Zomato, payment devices, KDS, or e-invoice) only as needed to complete that service.',
      'We may disclose records if required by law, tax authorities, or a lawful request.',
    ],
  },
  {
    heading: '5. Retention and security',
    paragraphs: [
      'Billing and GST-related records are kept for the period required by Indian tax and company law, and otherwise as the outlet configures.',
      'Access is limited to logged-in users with assigned permissions. Staff must not leave the POS unlocked or share passcodes.',
      'No method of storage is completely secure. Report suspected misuse to the outlet admin immediately.',
    ],
  },
  {
    heading: '6. Your choices',
    paragraphs: [
      'Staff can update name, email, mobile, and photo from Edit Profile. Username and outlet cannot be changed from that screen.',
      'Customers may ask the outlet to correct or remove a saved phone number or address, subject to records we must keep for billed orders.',
      'Turning off a connected service in configuration stops new sharing with that service; past orders already sent cannot always be recalled.',
    ],
  },
  {
    heading: '7. Contact',
    paragraphs: [
      `Privacy questions can be sent through Support Agent in the POS or to the outlet point of contact for ${brand.shortName}, Dadar.`,
    ],
  },
]

const COPY: Record<
  LegalDocKind,
  { title: string; subtitle: string; sections: Section[] }
> = {
  terms: {
    title: 'Terms & Conditions',
    subtitle: `Last updated ${LAST_UPDATED} · ${brand.shortName}`,
    sections: TERMS,
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: `Last updated ${LAST_UPDATED} · ${brand.shortName}`,
    sections: PRIVACY,
  },
}

interface LegalDocModalProps {
  kind: LegalDocKind | null
  onClose: () => void
}

export function LegalDocModal({ kind, onClose }: LegalDocModalProps) {
  const titleId = useId()
  const open = kind !== null
  const doc = kind ? COPY[kind] : null

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open || !doc) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={`Close ${doc.title}`}
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(84vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {doc.title}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{doc.subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-sm font-semibold text-ink">
                  {section.heading}
                </h3>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mt-1.5 text-sm leading-relaxed text-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
