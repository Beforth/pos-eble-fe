import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function RequiredMark() {
  return <span className="text-primary">*</span>
}

function HelpText({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-primary/90">{children}</p>
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
    <div className="grid gap-2 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start sm:gap-4">
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
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Provide information to reach out by {brand.shortName} team in case of
        any support.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">
              Communication Details
            </h2>
          </div>

          <FormRow label="Owner Mobile No." required>
            <input
              type="text"
              value={ownerMobile}
              onChange={(event) => setOwnerMobile(event.target.value)}
              className={inputClass}
            />
            <HelpText>
              Provide contact details (comma separated if multiple) to reach.
            </HelpText>
          </FormRow>

          <FormRow label="Manager's Phone Number">
            <input
              type="text"
              value={managerPhone}
              onChange={(event) => setManagerPhone(event.target.value)}
              className={inputClass}
            />
            <HelpText>
              Provide contact details of Manager who manages the outlet. (comma
              separated if multiple)
            </HelpText>
          </FormRow>

          <FormRow label="Decision Maker">
            <input
              type="text"
              value={decisionMaker}
              onChange={(event) => setDecisionMaker(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Direct Number" required>
            <input
              type="text"
              value={directNumber}
              onChange={(event) => setDirectNumber(event.target.value)}
              className={inputClass}
            />
            <HelpText>
              Provide a direct mobile number for {brand.shortName} support to
              reach in case of any Point of Sale related support. (Comma
              separated if multiple)
            </HelpText>
          </FormRow>

          <FormRow label="Biller Name">
            <input
              type="text"
              value={billerName}
              onChange={(event) => setBillerName(event.target.value)}
              className={inputClass}
            />
            <HelpText>
              Provide Biller name for {brand.shortName} support to reach in case
              of any Point of Sale related support.
            </HelpText>
          </FormRow>

          <FormRow label="Biller Phone Number">
            <input
              type="text"
              value={billerPhone}
              onChange={(event) => setBillerPhone(event.target.value)}
              className={inputClass}
            />
            <HelpText>
              Provide a Biller mobile number for {brand.shortName} support to
              reach in case of direct no. is not reachable for any Point of Sale
              related support. (Comma separated if multiple)
            </HelpText>
          </FormRow>
        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
