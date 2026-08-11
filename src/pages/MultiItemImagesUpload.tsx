import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import {
  Bike,
  Check,
  CloudUpload,
  FolderTree,
  ImagePlus,
  Lightbulb,
  Package,
  Play,
  Puzzle,
  ShoppingBag,
  Upload,
  Utensils,
  X,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { menuItems } from '../mocks/menuItemsData'

type ModuleType = 'item' | 'category' | 'addons'
type Step = 1 | 2

const MODULES: {
  id: ModuleType
  label: string
  hint: string
  icon: typeof Package
}[] = [
  { id: 'item', label: 'Item', hint: 'Menu items', icon: Package },
  { id: 'category', label: 'Category', hint: 'Category images', icon: FolderTree },
  { id: 'addons', label: 'Addons', hint: 'Addon groups', icon: Puzzle },
]

const PLATFORMS = [
  { id: 'home-delivery', label: 'Home Delivery', icon: Bike },
  { id: 'parcel', label: 'Parcel', icon: ShoppingBag },
  { id: 'dine-in', label: 'Dine In', icon: Utensils },
  { id: 'zomato', label: 'Zomato', logo: '/zomato.png' },
  { id: 'swiggy', label: 'Swiggy', logo: '/swiggy.png' },
] as const

const MAX_BYTES = 5 * 1024 * 1024
const MIN_SIZE = 400
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png']

interface UploadedImage {
  id: string
  file: File
  previewUrl: string
  matchedItemName: string | null
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchItemName(fileName: string) {
  const key = normalizeName(fileName)
  const found = menuItems.find((item) => normalizeName(item.name) === key)
  return found?.name ?? null
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="relative mx-auto mb-8 max-w-2xl px-2">
      <div className="absolute left-[16%] right-[16%] top-3.5 hidden h-px bg-line sm:block" />
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { n: 1 as const, label: 'Select Platform and Add Images' },
          { n: 2 as const, label: 'Review and Confirm to Upload' },
        ].map((s) => {
          const active = step === s.n
          const done = step > s.n
          return (
            <div
              key={s.n}
              className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center"
            >
              <span
                className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? 'bg-primary text-white shadow-[0_0_0_4px_rgba(255,9,23,0.12)]'
                    : done
                      ? 'bg-success text-white'
                      : 'bg-page text-muted ring-1 ring-line'
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : s.n}
              </span>
              <span
                className={`text-sm ${
                  active ? 'font-semibold text-ink' : 'font-medium text-muted'
                }`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MultiItemImagesUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>(1)
  const [moduleType, setModuleType] = useState<ModuleType | null>(null)
  const [platforms, setPlatforms] = useState<string[]>([])
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showPlatformSection = moduleType === 'item'
  const showUpload =
    moduleType === 'category' ||
    moduleType === 'addons' ||
    (moduleType === 'item' && platforms.length > 0)

  const allPlatformsSelected = platforms.length === PLATFORMS.length

  const canSubmitStep1 =
    Boolean(moduleType) &&
    images.length > 0 &&
    (moduleType !== 'item' || platforms.length > 0)

  const matchedCount = useMemo(
    () => images.filter((img) => img.matchedItemName).length,
    [images],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }

  function selectModule(id: ModuleType) {
    setModuleType(id)
    setPlatforms([])
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      return []
    })
  }

  function togglePlatform(id: string) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  function toggleSelectAll() {
    setPlatforms(allPlatformsSelected ? [] : PLATFORMS.map((p) => p.id))
  }

  function resetForm() {
    setStep(1)
    setModuleType(null)
    setPlatforms([])
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      return []
    })
  }

  async function validateAndAddFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    const accepted: UploadedImage[] = []
    let rejected = 0

    await Promise.all(
      files.map(
        (file) =>
          new Promise<void>((resolve) => {
            if (!ACCEPTED.includes(file.type) || file.size > MAX_BYTES) {
              rejected += 1
              resolve()
              return
            }
            const url = URL.createObjectURL(file)
            const img = new Image()
            img.onload = () => {
              if (img.width < MIN_SIZE || img.height < MIN_SIZE) {
                URL.revokeObjectURL(url)
                rejected += 1
                resolve()
                return
              }
              accepted.push({
                id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
                file,
                previewUrl: url,
                matchedItemName: matchItemName(file.name),
              })
              resolve()
            }
            img.onerror = () => {
              URL.revokeObjectURL(url)
              rejected += 1
              resolve()
            }
            img.src = url
          }),
      ),
    )

    if (accepted.length) setImages((prev) => [...prev, ...accepted])
    if (rejected) {
      showToast(
        `${rejected} file${rejected > 1 ? 's' : ''} skipped (size, type, or resolution).`,
      )
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      void validateAndAddFiles(event.target.files)
      event.target.value = ''
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    if (event.dataTransfer.files?.length) {
      void validateAndAddFiles(event.dataTransfer.files)
    }
  }

  function downloadItemList() {
    const header = 'Item Name,Short Code,Price\n'
    const rows = menuItems
      .map(
        (item) =>
          `"${item.name.replace(/"/g, '""')}",${item.shortCode},${item.price}`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'item-list.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
  }

  function handleConfirmUpload() {
    showToast(
      `${images.length} image${images.length > 1 ? 's' : ''} queued for upload.`,
    )
    resetForm()
  }

  return (
    <MenuPageShell
      title="Multi-Item Images Upload"
      backTo="/menu"
      activeItem="menu-images-upload"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {/* How It Works */}
      <section className="mb-4 overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex flex-col gap-5 bg-[linear-gradient(135deg,rgba(255,216,180,0.35)_0%,rgba(255,9,23,0.06)_45%,rgba(255,223,84,0.2)_100%)] p-4 sm:flex-row sm:items-stretch sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-deep shadow-sm">
                <Lightbulb size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">How It Works</h2>
                <p className="text-xs text-muted">
                  Bulk-match images to your menu in three steps
                </p>
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: 'Choose',
                  body: 'Rename files to match item names, pick platforms, then add images.',
                },
                {
                  title: 'Process',
                  body: 'We auto-match images to menu rows using the file name.',
                },
                {
                  title: 'Review',
                  body: 'Confirm matches and assign any unmatched images before upload.',
                },
              ].map((item, index) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-white/70 bg-card/80 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            className="group relative mx-auto aspect-video w-full max-w-[240px] shrink-0 overflow-hidden rounded-xl border border-line bg-ink shadow-sm sm:mx-0 sm:self-center"
            aria-label="Watch tutorial video"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,9,23,0.45),transparent_55%),linear-gradient(160deg,#2a1515_0%,#1a1a1a_100%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-105">
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </span>
              <span className="text-xs font-medium text-white/90">
                Watch tutorial
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Wizard */}
      <section className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="border-b border-line bg-page/60 px-4 py-5 sm:px-6">
          <Stepper step={step} />
        </div>

        <div className="p-4 sm:p-6">
          {step === 1 ? (
            <>
              {/* Module cards */}
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold text-ink">
                  Module <span className="font-normal text-muted">— what are you uploading for?</span>
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {MODULES.map((mod) => {
                    const Icon = mod.icon
                    const selected = moduleType === mod.id
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => selectModule(mod.id)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(255,9,23,0.25)]'
                            : 'border-line bg-card hover:border-primary/30 hover:bg-page'
                        }`}
                      >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? 'bg-primary text-white'
                              : 'bg-page text-muted'
                          }`}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink">
                            {mod.label}
                          </span>
                          <span className="block text-xs text-muted">
                            {mod.hint}
                          </span>
                        </span>
                        <span
                          className={`ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? 'border-primary bg-primary'
                              : 'border-line bg-card'
                          }`}
                        >
                          {selected ? (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          ) : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {!moduleType ? (
                <div className="mb-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-page/50 px-6 py-14 text-center">
                  <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ImagePlus size={22} />
                  </span>
                  <p className="text-sm font-semibold text-ink">
                    Select a module to continue
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted">
                    Choose Item, Category, or Addons to configure platforms and
                    start adding images.
                  </p>
                </div>
              ) : null}

              {showPlatformSection ? (
                <div className="mb-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      Choose Where To Upload
                    </span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      Platform
                    </span>
                  </div>

                  <div className="rounded-xl border border-line p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          Select Platform And Verify Items
                          <span className="text-primary">*</span>
                        </h3>
                        <p className="mt-1 max-w-xl text-sm text-muted">
                          Download the item list and rename image files to match
                          item names for accurate matching.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadItemList}
                        className="h-9 shrink-0 rounded-lg border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary/5"
                      >
                        Download Item List
                      </button>
                    </div>

                    <div className="mb-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                        <input
                          type="checkbox"
                          checked={allPlatformsSelected}
                          onChange={toggleSelectAll}
                          className="size-4 rounded border-line accent-primary"
                        />
                        Select All
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {PLATFORMS.map((platform) => {
                        const selected = platforms.includes(platform.id)
                        const Icon =
                          'icon' in platform ? platform.icon : undefined
                        return (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => togglePlatform(platform.id)}
                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                              selected
                                ? 'border-primary bg-primary/5'
                                : 'border-line bg-card hover:bg-page'
                            }`}
                          >
                            <span
                              className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                                selected
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-line bg-card'
                              }`}
                            >
                              {selected ? (
                                <Check size={10} strokeWidth={3} />
                              ) : null}
                            </span>
                            {'logo' in platform && platform.logo ? (
                              <img
                                src={platform.logo}
                                alt=""
                                className="size-6 object-contain"
                              />
                            ) : Icon ? (
                              <Icon
                                size={16}
                                className={
                                  selected ? 'text-primary' : 'text-muted'
                                }
                              />
                            ) : null}
                            <span className="text-sm font-medium text-ink">
                              {platform.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {platforms.length === 0 ? (
                      <p className="mt-3 text-xs text-accent">
                        Select at least one platform to unlock image upload.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {showUpload ? (
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">
                      Add Images<span className="text-primary">*</span>
                    </h3>
                    <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {images.length} Images Added
                    </span>
                  </div>

                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`rounded-xl border-2 border-dashed px-4 py-12 text-center transition-colors ${
                      dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-primary/40 bg-[linear-gradient(180deg,rgba(255,9,23,0.03)_0%,transparent_100%)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mx-auto mb-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                    >
                      <Upload size={16} />
                      Browse Files
                    </button>
                    <p className="mb-5 text-xs text-muted">
                      or drag and drop images here
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      multiple
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <div className="mx-auto grid max-w-3xl gap-2 text-left text-sm text-muted sm:grid-cols-3 sm:text-center">
                      <p>
                        <span className="font-semibold text-ink">Size</span>
                        <br />
                        Under 5 MB each
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Resolution</span>
                        <br />
                        Min 400 × 400 px
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Format</span>
                        <br />
                        JPG, JPEG, or PNG
                      </p>
                    </div>
                  </div>

                  {images.length > 0 ? (
                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {images.map((img) => (
                        <li
                          key={img.id}
                          className="group relative overflow-hidden rounded-xl border border-line bg-page"
                        >
                          <img
                            src={img.previewUrl}
                            alt={img.file.name}
                            className="aspect-square w-full object-cover"
                          />
                          <div className="p-2">
                            <p className="truncate text-xs font-medium text-ink">
                              {img.file.name}
                            </p>
                            <p
                              className={`mt-0.5 truncate text-[11px] ${
                                img.matchedItemName
                                  ? 'text-success'
                                  : 'text-accent'
                              }`}
                            >
                              {img.matchedItemName
                                ? `Matched: ${img.matchedItemName}`
                                : 'Unmatched'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            aria-label={`Remove ${img.file.name}`}
                            className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ink/75 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-8 flex justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-muted hover:bg-page hover:text-ink"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={!canSubmitStep1}
                  onClick={() => {
                    if (canSubmitStep1) setStep(2)
                  }}
                  className="h-9 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Submit
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-line bg-page/80 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Review matches before upload
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {matchedCount} of {images.length} matched by filename
                    {moduleType === 'item' && platforms.length
                      ? ` · ${platforms
                          .map(
                            (id) =>
                              PLATFORMS.find((p) => p.id === id)?.label ?? id,
                          )
                          .join(', ')}`
                      : ''}
                    {moduleType && moduleType !== 'item'
                      ? ` · ${moduleType === 'category' ? 'Category' : 'Addons'}`
                      : ''}
                  </p>
                </div>
                <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  Step 2 of 2
                </span>
              </div>

              <ul className="mb-2 divide-y divide-line overflow-hidden rounded-xl border border-line">
                {images.map((img) => (
                  <li
                    key={img.id}
                    className="flex items-center gap-3 bg-card px-3 py-2.5 sm:px-4"
                  >
                    <img
                      src={img.previewUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {img.file.name}
                      </p>
                      <p
                        className={`truncate text-xs ${
                          img.matchedItemName ? 'text-success' : 'text-accent'
                        }`}
                      >
                        {img.matchedItemName
                          ? `→ ${img.matchedItemName}`
                          : 'No automatic match — assign manually later'}
                      </p>
                    </div>
                    {img.matchedItemName ? (
                      <CloudUpload
                        size={16}
                        className="shrink-0 text-success"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-muted hover:bg-page hover:text-ink"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  className="h-9 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  Confirm Upload
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </MenuPageShell>
  )
}
