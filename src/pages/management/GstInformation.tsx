import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Hash,
  MapPin,
  ReceiptText,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigFormRow,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const STATE_OPTIONS = [
  'Maharashtra',
  'Gujarat',
  'Karnataka',
  'Delhi',
  'Rajasthan',
  'Madhya Pradesh',
  'Goa',
  'Other',
]

const CITY_OPTIONS = [
  'Bhiwandi',
  'Nashik',
  'Mumbai',
  'Pune',
  'Thane',
  'Nagpur',
  'Other',
]

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-muted'
const textareaClass =
  'min-h-[88px] w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-muted'
const selectClass =
  'h-10 w-full max-w-md rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

const INITIAL = {
  hasGst: true as boolean,
  gstNo: '27BHFPJ0010E1Z4',
  registeredName: "ANNAPURNA'S RAJUBHAI DABELIWALE",
  registeredAddress:
    'SUNRICH APARTMENT, SHOP NO 1, SAMARTH NAGAR, Nashik, Nashik, Maharashtra, 422005',
  state: 'Maharashtra',
  city: 'Bhiwandi',
  vatNumber: '',
  pan: '',
  cin: '',
  location: 'Nashik',
  zipCode: '422005',
}

export default function GstInformation() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [hasGst, setHasGst] = useState(INITIAL.hasGst)
  const [gstNo, setGstNo] = useState(INITIAL.gstNo)
  const [gstEditable, setGstEditable] = useState(false)
  const [gstVerified, setGstVerified] = useState(true)
  const [registeredName, setRegisteredName] = useState(INITIAL.registeredName)
  const [registeredAddress, setRegisteredAddress] = useState(
    INITIAL.registeredAddress,
  )
  const [state, setState] = useState(INITIAL.state)
  const [city, setCity] = useState(INITIAL.city)
  const [vatNumber, setVatNumber] = useState(INITIAL.vatNumber)
  const [pan, setPan] = useState(INITIAL.pan)
  const [cin, setCin] = useState(INITIAL.cin)
  const [location, setLocation] = useState(INITIAL.location)
  const [zipCode, setZipCode] = useState(INITIAL.zipCode)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/accounting')
  }

  function handleCancel() {
    setHasGst(INITIAL.hasGst)
    setGstNo(INITIAL.gstNo)
    setGstEditable(false)
    setGstVerified(true)
    setRegisteredName(INITIAL.registeredName)
    setRegisteredAddress(INITIAL.registeredAddress)
    setState(INITIAL.state)
    setCity(INITIAL.city)
    setVatNumber(INITIAL.vatNumber)
    setPan(INITIAL.pan)
    setCin(INITIAL.cin)
    setLocation(INITIAL.location)
    setZipCode(INITIAL.zipCode)
    showToast('Changes discarded')
  }

  function handleSave() {
    if (hasGst && !gstNo.trim()) {
      showToast('Please enter GST No')
      return
    }
    if (hasGst && gstEditable) {
      setGstVerified(true)
      setGstEditable(false)
    }
    showToast('GST information saved')
  }

  function handleEditGst() {
    setGstEditable(true)
    setGstVerified(false)
    showToast('Edit GST No and save to re-verify')
  }

  return (
    <ReportsPageShell
      title={
        <ConfigBreadcrumb
          onNavigate={goBack}
          current="GST Information"
          parent="Accounting"
        />
      }
      activeItem="acct-gst-information"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 max-w-xs">
        <select
          defaultValue={brand.shopName}
          className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm font-medium text-ink outline-none focus:border-primary"
          aria-label="Business"
        >
          <option value={brand.shopName}>{brand.shopName}</option>
        </select>
      </div>

      <ConfigSectionCard
        icon={<ReceiptText size={16} />}
        title="GST Registration"
        description="Configure whether your outlet is registered under GST."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Do you have GST No?" align="center">
            <div className="flex flex-wrap items-center gap-5">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="has-gst"
                  checked={hasGst}
                  onChange={() => setHasGst(true)}
                  className="size-4 accent-primary"
                />
                Yes
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="has-gst"
                  checked={!hasGst}
                  onChange={() => setHasGst(false)}
                  className="size-4 accent-primary"
                />
                No
              </label>
            </div>
          </ConfigFormRow>

          {hasGst ? (
            <ConfigFormRow label="GST No">
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[220px] flex-1 max-w-md">
                    <input
                      type="text"
                      value={gstNo}
                      onChange={(event) =>
                        setGstNo(event.target.value.toUpperCase())
                      }
                      disabled={!gstEditable}
                      className={`${inputClass} pr-16`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1">
                      {!gstVerified ? (
                        <AlertCircle size={16} className="text-muted" />
                      ) : null}
                      {gstVerified ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : null}
                    </span>
                  </div>
                  <OutlineButton onClick={handleEditGst}>
                    Edit GST No
                  </OutlineButton>
                </div>
                <MutedHelp>
                  Note:- Your GST No is verified.{' '}
                  <button
                    type="button"
                    onClick={handleEditGst}
                    className="font-medium text-primary hover:underline"
                  >
                    Click here
                  </button>{' '}
                  to edit and re-verify.
                </MutedHelp>
              </>
            </ConfigFormRow>
          ) : null}
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Building2 size={16} />}
        title="Registered Details"
        description="These details appear on invoices generated for your customers."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Registered Name For Invoice" align="center">
            <input
              type="text"
              value={registeredName}
              onChange={(event) => setRegisteredName(event.target.value)}
              disabled={hasGst && gstVerified && !gstEditable}
              className={`${inputClass} max-w-xl`}
            />
          </ConfigFormRow>

          <ConfigFormRow label="Registered Address For Invoice">
            <textarea
              value={registeredAddress}
              onChange={(event) => setRegisteredAddress(event.target.value)}
              disabled={hasGst && gstVerified && !gstEditable}
              className={`${textareaClass} max-w-xl`}
              rows={3}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<MapPin size={16} />}
        title="Location"
      >
        <div className="space-y-4">
          <ConfigFormRow label="State" align="center">
            <select
              value={state}
              onChange={(event) => setState(event.target.value)}
              className={selectClass}
            >
              {STATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ConfigFormRow>

          <ConfigFormRow label="City" align="center">
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={selectClass}
            >
              {CITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ConfigFormRow>

          <ConfigFormRow label="Location" align="center">
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={`${inputClass} max-w-md`}
            />
          </ConfigFormRow>

          <ConfigFormRow label="Zip Code" align="center">
            <input
              type="text"
              value={zipCode}
              onChange={(event) => setZipCode(event.target.value)}
              className={`${inputClass} max-w-md`}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Hash size={16} />}
        title="Other Tax Identifiers"
        description="Optional registration numbers, if applicable to your business."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Vat Number (If Any)" align="center">
            <input
              type="text"
              value={vatNumber}
              onChange={(event) => setVatNumber(event.target.value)}
              className={`${inputClass} max-w-md`}
            />
          </ConfigFormRow>

          <ConfigFormRow label="PAN" align="center">
            <input
              type="text"
              value={pan}
              onChange={(event) => setPan(event.target.value.toUpperCase())}
              className={`${inputClass} max-w-md`}
            />
          </ConfigFormRow>

          <ConfigFormRow label="CIN" align="center">
            <input
              type="text"
              value={cin}
              onChange={(event) => setCin(event.target.value.toUpperCase())}
              className={`${inputClass} max-w-md`}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={handleCancel} onSave={handleSave} />
    </ReportsPageShell>
  )
}
