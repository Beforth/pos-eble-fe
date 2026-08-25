import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Headset, PhoneCall } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function RequiredMark() {
  return <span className="text-primary">*</span>
}

function MutedHelp({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <label className="text-sm font-medium text-ink sm:pt-2.5">
        {label} {required ? <RequiredMark /> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function ContactDetails() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [ownerMobile, setOwnerMobile] = useState('9168169991')
  const [managerPhone, setManagerPhone] = useState('9168169991')
  const [decisionMaker, setDecisionMaker] = useState('Devesh Jobanputra')
  const [directNumber, setDirectNumber] = useState('9168169991')
  const [billerName, setBillerName] = useState('')
  const [billerPhone, setBillerPhone] = useState('')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function handleSave() {
    if (!ownerMobile.trim() || !directNumber.trim()) {
      showToast('Please fill required contact fields')
      return
    }
    showToast('Contact details saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/management/configuration/outlet')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/management/configuration/outlet')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Outlet Configuration
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Contact Details</span>
        </span>
      }
      activeItem="config-outlet"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Provide information to reach out by {brand.shortName} team in case of
        any support.
      </p>

      <SectionCard
        icon={<PhoneCall size={16} />}
        title="Primary Contacts"
        description="Owner and manager numbers used for account related communication."
      >
        <div className="space-y-4">
          <FormRow label="Owner Mobile No." required>
            <input
              type="text"
              value={ownerMobile}
              onChange={(event) => setOwnerMobile(event.target.value)}
              placeholder="e.g. 9876543210, 9812345678"
              className={inputClass}
            />
            <MutedHelp>
              Provide contact details (comma separated if multiple) to reach.
            </MutedHelp>
          </FormRow>

          <FormRow label="Manager's Phone Number">
            <input
              type="text"
              value={managerPhone}
              onChange={(event) => setManagerPhone(event.target.value)}
              placeholder="Manager's contact number"
              className={inputClass}
            />
            <MutedHelp>
              Provide contact details of Manager who manages the outlet. (comma
              separated if multiple)
            </MutedHelp>
          </FormRow>

          <FormRow label="Decision Maker">
            <input
              type="text"
              value={decisionMaker}
              onChange={(event) => setDecisionMaker(event.target.value)}
              placeholder="Name of the decision maker"
              className={inputClass}
            />
          </FormRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Headset size={16} />}
        title="Support Contacts"
        description="Numbers our support team uses when reaching your outlet."
      >
        <div className="space-y-4">
          <FormRow label="Direct Number" required>
            <input
              type="text"
              value={directNumber}
              onChange={(event) => setDirectNumber(event.target.value)}
              placeholder="Direct mobile number"
              className={inputClass}
            />
            <MutedHelp>
              Provide a direct mobile number for {brand.shortName} support to
              reach in case of any Point of Sale related support. (Comma
              separated if multiple)
            </MutedHelp>
          </FormRow>

          <FormRow label="Biller Name">
            <input
              type="text"
              value={billerName}
              onChange={(event) => setBillerName(event.target.value)}
              placeholder="Name of the biller"
              className={inputClass}
            />
            <MutedHelp>
              Provide Biller name for {brand.shortName} support to reach in case
              of any Point of Sale related support.
            </MutedHelp>
          </FormRow>

          <FormRow label="Biller Phone Number">
            <input
              type="text"
              value={billerPhone}
              onChange={(event) => setBillerPhone(event.target.value)}
              placeholder="Biller's contact number"
              className={inputClass}
            />
            <MutedHelp>
              Provide a Biller mobile number for {brand.shortName} support to
              reach in case the direct no. is not reachable for any Point of
              Sale related support. (Comma separated if multiple)
            </MutedHelp>
          </FormRow>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </ReportsPageShell>
  )
}
