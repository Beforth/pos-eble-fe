<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react'
import { Info, Loader2, Search, X } from 'lucide-react'
=======
import { useEffect, useMemo, useRef, useState } from 'react'
import { Info, Loader2, Search } from 'lucide-react'
>>>>>>> origin/main
import { SearchableSelect } from '../inventory/SearchableSelect'
import {
  getPermissionCatalogApi,
  getPermissionGroupsApi,
  type CatalogFeature,
  type PermissionCatalog,
  type PermissionGroup,
} from '../../services/permissionService'
import {
  getGroupPermissionsApi,
  listGroupsApi,
  updateGroupPermissionsApi,
  type GroupSummary,
} from '../../services/groupService'
import { ApiError } from '../../services/apiClient'
import { showToast } from '../../utils/toast'

export type PermissionCategoryId = string

export interface PermissionCategory {
  id: PermissionCategoryId
  label: string
  required?: boolean
}

type YesPermission = {
  id: string
  label: string
  category: string
  kind: 'yes'
  defaultChecked: boolean
  info?: string
}

type MultiPermission = {
  id: string
  label: string
  category: string
  kind: 'multi'
  options: string[]
  defaultSelected: string[]
  info?: string
}

type ReportPermission = {
  id: string
  label: string
  category: string
  kind: 'report'
  hasDisplayValues: boolean
  defaultShow: boolean
  defaultDisplayValues: boolean
  defaultDays: string
  info?: string
}

export type PermissionDef = YesPermission | MultiPermission | ReportPermission

export interface BillerPermissionsValue {
  group: string
<<<<<<< HEAD
  selectedGroup: string
  selectedGroups: string[]
  selectedCodenames: string[]
  tables: string[]
=======
>>>>>>> origin/main
}

export interface BillerPermissionsPanelProps {
  initial?: BillerPermissionsValue | null
  onChange?: (value: BillerPermissionsValue) => void
}

<<<<<<< HEAD
const NO_GROUP = 'No Group Selected'
=======
const NO_GROUP_LABEL = 'No Group Selected'
>>>>>>> origin/main

const REPORT_DAYS_OPTIONS = [
  'No Restriction',
  'Today',
  '7 Days',
  '15 Days',
  '30 Days',
]

function buildCategories(catalog: PermissionCatalog): PermissionCategory[] {
  return [
    { id: 'all', label: 'All Permissions' },
    ...catalog.categories.map((category) => ({
      id: category.code,
      label: category.label,
    })),
    { id: 'tables', label: 'Tables', required: true },
  ]
}

function catalogToDefs(catalog: PermissionCatalog): PermissionDef[] {
  return catalog.features.map((feature) => {
    const category = feature.category
    const info = feature.info ?? undefined
    if (feature.mode === 'yes') {
      return {
        id: feature.key,
        label: feature.label,
        category,
        kind: 'yes',
        defaultChecked: feature.defaults.checked ?? true,
        info,
      }
    }
    if (feature.mode === 'multi') {
      return {
        id: feature.key,
        label: feature.label,
        category,
        kind: 'multi',
        options: feature.options,
        defaultSelected: [...(feature.defaults.selected ?? feature.options)],
        info,
      }
    }
    return {
      id: feature.key,
      label: feature.label,
      category,
      kind: 'report',
      hasDisplayValues: feature.defaults.has_display_values ?? false,
      defaultShow: feature.defaults.show ?? true,
      defaultDisplayValues: feature.defaults.display_values ?? false,
      defaultDays: feature.defaults.days ?? 'No Restriction',
      info,
    }
  })
}

type YesState = Record<string, boolean>
type MultiState = Record<string, string[]>
type ReportState = Record<
  string,
  { show: boolean; displayValues: boolean; days: string }
>

function buildDefaultYes(defs: PermissionDef[]): YesState {
  const state: YesState = {}
  for (const item of defs) {
    if (item.kind === 'yes') state[item.id] = item.defaultChecked
  }
  return state
}

function buildDefaultMulti(defs: PermissionDef[]): MultiState {
  const state: MultiState = {}
  for (const item of defs) {
    if (item.kind === 'multi') state[item.id] = [...item.defaultSelected]
  }
  return state
}

function buildDefaultReport(defs: PermissionDef[]): ReportState {
  const state: ReportState = {}
  for (const item of defs) {
    if (item.kind === 'report') {
      state[item.id] = {
        show: item.defaultShow,
        displayValues: item.defaultDisplayValues,
        days: item.defaultDays,
      }
    }
  }
  return state
}

function isPermissionEnabled(
  item: PermissionDef,
  yesState: YesState,
  multiState: MultiState,
  reportState: ReportState,
): boolean {
  if (item.kind === 'yes') return Boolean(yesState[item.id])
  if (item.kind === 'multi') return (multiState[item.id] ?? []).length > 0
  if (item.kind === 'report') return Boolean(reportState[item.id]?.show)
  return true
}

function bareCodename(codename: string): string {
  return codename.split('.').pop() ?? codename
}

<<<<<<< HEAD
function applyBareCodenames(
  features: CatalogFeature[],
  codes: Set<string>,
): { yes: YesState; multi: MultiState; report: ReportState } {
  const yes: YesState = {}
  const multi: MultiState = {}
  const report: ReportState = {}
  for (const feature of features) {
    const codenameFor = (label: string): string => {
      const codename = feature.permissions.find(
        (permission) => permission.label === label,
      )?.codename
      return codename ? bareCodename(codename) : ''
    }
    if (feature.mode === 'yes') {
      yes[feature.key] = codes.has(
        codenameFor(feature.permissions[0]?.label ?? ''),
      )
    } else if (feature.mode === 'multi') {
      multi[feature.key] = feature.options.filter((option) => {
        const codename = feature.permissions.find(
          (permission) => permission.label === option,
        )?.codename
        return codename ? codes.has(bareCodename(codename)) : false
      })
    } else {
      report[feature.key] = {
        show: codes.has(codenameFor('View')),
        displayValues: codes.has(codenameFor('Display Values')),
        days: 'No Restriction',
      }
    }
  }
  return { yes, multi, report }
}

function unionPermissionState(
  current: { yes: YesState; multi: MultiState; report: ReportState },
  incoming: { yes: YesState; multi: MultiState; report: ReportState },
): { yes: YesState; multi: MultiState; report: ReportState } {
  const yes: YesState = { ...current.yes }
  for (const [key, value] of Object.entries(incoming.yes)) {
    yes[key] = Boolean(yes[key] || value)
  }
  const multi: MultiState = { ...current.multi }
  for (const [key, options] of Object.entries(incoming.multi)) {
    multi[key] = [...new Set([...(multi[key] ?? []), ...options])]
  }
  const report: ReportState = { ...current.report }
  for (const [key, value] of Object.entries(incoming.report)) {
    const prev = report[key]
    report[key] = {
      show: Boolean(prev?.show || value.show),
      displayValues: Boolean(prev?.displayValues || value.displayValues),
      days: prev?.days ?? value.days,
    }
  }
  return { yes, multi, report }
=======
function canonical(codes: string[]): string {
  return codes.join('|')
>>>>>>> origin/main
}

function computeSelectedCodenames(
  features: CatalogFeature[],
  yesState: YesState,
  multiState: MultiState,
  reportState: ReportState,
): string[] {
  const selected: string[] = []
  for (const feature of features) {
    const codenameFor = (label: string): string | undefined =>
      feature.permissions
        .find((permission) => permission.label === label)
        ?.codename.split('.')
        .pop()
    if (feature.mode === 'yes') {
      if (yesState[feature.key]) {
        const codename = feature.permissions[0]?.codename.split('.').pop()
        if (codename) selected.push(codename)
      }
    } else if (feature.mode === 'multi') {
      for (const option of multiState[feature.key] ?? []) {
        const codename = codenameFor(option)
        if (codename) selected.push(codename)
      }
    } else {
      const report = reportState[feature.key]
      if (report?.show) {
        const codename = codenameFor('View')
        if (codename) selected.push(codename)
      }
      if (report?.displayValues) {
        const codename = codenameFor('Display Values')
        if (codename) selected.push(codename)
      }
    }
  }
  return selected
}

function seedStatesFromCodenames(
  features: CatalogFeature[],
  codenames: string[],
): { yes: YesState; multi: MultiState; report: ReportState } {
  const codes = new Set(codenames.map(bareCodename))
  const yes: YesState = {}
  const multi: MultiState = {}
  const report: ReportState = {}
  for (const feature of features) {
    const codenameFor = (label: string): string => {
      const codename = feature.permissions.find(
        (permission) => permission.label === label,
      )?.codename
      return codename ? bareCodename(codename) : ''
    }
    if (feature.mode === 'yes') {
      yes[feature.key] = codes.has(codenameFor(feature.permissions[0]?.label ?? ''))
    } else if (feature.mode === 'multi') {
      multi[feature.key] = feature.options.filter((option) => {
        const codename = feature.permissions.find(
          (permission) => permission.label === option,
        )?.codename
        return codename ? codes.has(bareCodename(codename)) : false
      })
    } else {
      report[feature.key] = {
        show: codes.has(codenameFor('View')),
        displayValues: codes.has(codenameFor('Display Values')),
        days: 'No Restriction',
      }
    }
  }
  return { yes, multi, report }
}

export function BillerPermissionsPanel({
  initial,
  onChange,
}: BillerPermissionsPanelProps = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [defs, setDefs] = useState<PermissionDef[]>([])
  const [features, setFeatures] = useState<CatalogFeature[]>([])
  const [categories, setCategories] = useState<PermissionCategory[]>([])
<<<<<<< HEAD
  const [groups, setGroups] = useState<PermissionGroup[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
=======
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [groupError, setGroupError] = useState<string | null>(null)
  const [groupLoading, setGroupLoading] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [group, setGroup] = useState(NO_GROUP_LABEL)
>>>>>>> origin/main
  const [category, setCategory] = useState<PermissionCategoryId>('pos')
  const [search, setSearch] = useState('')
  const [yesState, setYesState] = useState<YesState>({})
  const [multiState, setMultiState] = useState<MultiState>({})
  const [reportState, setReportState] = useState<ReportState>({})

  const saveTimer = useRef<number | null>(null)
  const lastSaved = useRef<string>('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getPermissionCatalogApi(), getPermissionGroupsApi()])
      .then(([catalog, nextGroups]) => {
        if (cancelled) return
        const next = catalogToDefs(catalog)
        setDefs(next)
        setFeatures(catalog.features)
        setCategories(buildCategories(catalog))
        setGroups(nextGroups)
        setYesState(buildDefaultYes(next))
        setMultiState(buildDefaultMulti(next))
        setReportState(buildDefaultReport(next))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
<<<<<<< HEAD
    if (!initial || features.length === 0) return
    const applied = applyBareCodenames(
      features,
      new Set(
        (initial.selectedCodenames ?? []).map((codename) =>
          bareCodename(codename),
        ),
      ),
    )
    setYesState(applied.yes)
    setMultiState(applied.multi)
    setReportState(applied.report)
    const savedGroups =
      initial.selectedGroups && initial.selectedGroups.length > 0
        ? initial.selectedGroups
        : [initial.selectedGroup, initial.group].filter(
            (name): name is string =>
              Boolean(name) && name !== NO_GROUP,
          )
    setSelectedGroups(savedGroups)
    if (initial.tables) setSelectedTables(initial.tables)
  }, [initial, features])
=======
    let cancelled = false
    listGroupsApi()
      .then((rows) => {
        if (cancelled) return
        setGroups(rows)
      })
      .catch(() => {
        if (!cancelled) setGroupError('Could not load groups.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const groupNames = useMemo(() => groups.map((row) => row.name), [groups])
  const groupById = useMemo(
    () => new Map(groups.map((row) => [row.name, row.id])),
    [groups],
  )
  const groupOptions = useMemo(
    () => [NO_GROUP_LABEL, ...groupNames],
    [groupNames],
  )

  useEffect(() => {
    if (!initial) return
    setGroup(initial.group || NO_GROUP_LABEL)
  }, [initial])

  const selectedCodenames = useMemo(
    () => computeSelectedCodenames(features, yesState, multiState, reportState),
    [features, yesState, multiState, reportState],
  )

  useEffect(() => {
    if (!group || group === NO_GROUP_LABEL) return
    const groupId = groupById.get(group)
    if (!groupId) return
    if (features.length === 0) return
    let cancelled = false
    setGroupLoading(true)
    getGroupPermissionsApi(groupId)
      .then((codenames) => {
        if (cancelled) return
        const seeded = seedStatesFromCodenames(features, codenames)
        setYesState(seeded.yes)
        setMultiState(seeded.multi)
        setReportState(seeded.report)
        lastSaved.current = canonical(
          computeSelectedCodenames(features, seeded.yes, seeded.multi, seeded.report),
        )
      })
      .catch(() => {
        if (!cancelled) {
          showToast('Could not load group permissions', 'Please try again.', 'danger')
        }
      })
      .finally(() => {
        if (!cancelled) setGroupLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [group, groupById, features])

  async function flushGroupSave() {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    if (!group || group === NO_GROUP_LABEL) return
    const groupId = groupById.get(group)
    if (!groupId) return
    const payload = canonical(selectedCodenames)
    if (payload === lastSaved.current) return
    setSavingGroup(true)
    try {
      await updateGroupPermissionsApi(groupId, selectedCodenames)
      lastSaved.current = payload
      showToast(`${group} group permissions saved`, undefined, 'success')
    } catch (err) {
      showToast(
        `Could not save ${group} permissions`,
        err instanceof ApiError ? err.message : 'Please try again.',
        'danger',
      )
    } finally {
      setSavingGroup(false)
    }
  }

  function scheduleGroupSave() {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null
      void flushGroupSave()
    }, 500)
  }

  function handleGroupChange(next: string) {
    if (next === group) return
    void flushGroupSave()
    setGroup(next)
  }

  useEffect(() => {
    onChange?.({ group })
  }, [onChange, group])
>>>>>>> origin/main

  const groupOptions = useMemo(() => {
    const names = groups.map((item) => item.name)
    const extra = selectedGroups.filter((name) => !names.includes(name))
    return [...names, ...extra].filter((name) => !selectedGroups.includes(name))
  }, [groups, selectedGroups])

  function addGroup(name: string) {
    if (!name || selectedGroups.includes(name)) return
    setSelectedGroups((prev) => [...prev, name])
    const match = groups.find((item) => item.name === name)
    if (!match) return
    const merged = unionPermissionState(
      { yes: yesState, multi: multiState, report: reportState },
      applyBareCodenames(
        features,
        new Set(match.permissions.map((codename) => bareCodename(codename))),
      ),
    )
    setYesState(merged.yes)
    setMultiState(merged.multi)
    setReportState(merged.report)
  }

  function removeGroup(name: string) {
    setSelectedGroups((prev) => prev.filter((item) => item !== name))
  }

  const TABLE_NUMBERS = ['1', '2']

  const [selectedTables, setSelectedTables] = useState<string[]>(TABLE_NUMBERS)

  const isAllTablesSelected =
    selectedTables.length === TABLE_NUMBERS.length

  function toggleAllTables() {
    if (isAllTablesSelected) {
      setSelectedTables([])
    } else {
      setSelectedTables([...TABLE_NUMBERS])
    }
  }

  function toggleTable(tableNo: string) {
    setSelectedTables((prev) =>
      prev.includes(tableNo)
        ? prev.filter((item) => item !== tableNo)
        : [...prev, tableNo],
    )
  }

<<<<<<< HEAD
  const selectedCodenames = useMemo(
    () => computeSelectedCodenames(features, yesState, multiState, reportState),
    [features, yesState, multiState, reportState],
  )

  useEffect(() => {
    const primary = selectedGroups[0] ?? ''
    onChange?.({
      group: primary,
      selectedGroup: primary,
      selectedGroups,
      selectedCodenames,
      tables: selectedTables,
    })
  }, [onChange, selectedGroups, selectedCodenames, selectedTables])

=======
>>>>>>> origin/main
  const enabledCount = useMemo(
    () =>
      defs.filter((item) =>
        isPermissionEnabled(item, yesState, multiState, reportState),
      ).length + (selectedTables.length > 0 ? 1 : 0),
    [defs, yesState, multiState, reportState, selectedTables],
  )

  const totalCount = defs.length + 1

  const visiblePermissions = useMemo(() => {
    const q = search.trim().toLowerCase()
    return defs.filter((item) => {
      const categoryOk = category === 'all' || item.category === category
      const searchOk = !q || item.label.toLowerCase().includes(q)
      return categoryOk && searchOk
    })
  }, [defs, category, search])

  const showingReportsOnly =
    category === 'rpt' ||
    (visiblePermissions.length > 0 &&
      visiblePermissions.every((item) => item.kind === 'report'))

  const listTitle = showingReportsOnly
    ? 'Desktop Report Rights'
    : (categories.find((item) => item.id === category)?.label ?? 'Permissions')

  function toggleYes(id: string) {
    if (groupLoading) return
    setYesState((prev) => ({ ...prev, [id]: !prev[id] }))
    scheduleGroupSave()
  }

  function toggleMulti(id: string, option: string) {
    if (groupLoading) return
    setMultiState((prev) => {
      const current = prev[id] ?? []
      const next = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
      return { ...prev, [id]: next }
    })
    scheduleGroupSave()
  }

  function patchReport(
    id: string,
    patch: Partial<{ show: boolean; displayValues: boolean; days: string }>,
  ) {
    if (groupLoading) return
    setReportState((prev) => ({
      ...prev,
      [id]: {
        show: prev[id]?.show ?? true,
        displayValues: prev[id]?.displayValues ?? false,
        days: prev[id]?.days ?? 'No Restriction',
        ...patch,
      },
    }))
    scheduleGroupSave()
  }

  if (loading) {
    return (
      <div className="flex h-[620px] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card">
        <Loader2 size={22} className="animate-spin text-primary" />
        <p className="text-sm text-muted">Loading permissions…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[620px] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card px-6 text-center">
        <p className="text-sm font-semibold text-ink">
          Could not load groups or the permission catalog.
        </p>
        <p className="text-xs text-muted">
          Sign in again or contact support if this keeps happening.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full min-w-[200px] sm:max-w-xs">
          <SearchableSelect
            label=""
<<<<<<< HEAD
            value=""
            options={groupOptions}
            placeholder="Select a group"
            searchPlaceholder="Search groups"
            onChange={addGroup}
=======
            value={group}
            options={groupOptions}
            onChange={handleGroupChange}
>>>>>>> origin/main
          />
          {groupError ? (
            <p className="mt-1 text-xs text-danger">{groupError}</p>
          ) : null}
          {savingGroup ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
              <Loader2 size={12} className="animate-spin" />
              Saving group permissions…
            </p>
          ) : null}
        </div>
        <label className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rights"
            className="h-10 w-full rounded-md border border-line bg-card py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </label>
      </div>

      {selectedGroups.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedGroups.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-page px-2.5 py-1 text-xs font-medium text-ink"
            >
              {name}
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => removeGroup(name)}
                className="rounded-full p-0.5 text-muted hover:bg-card hover:text-ink"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <p className="text-sm font-semibold text-ink">
        Permissions ({enabledCount} / {totalCount})
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex h-[620px] flex-col lg:flex-row">
          <aside className="w-full shrink-0 overflow-y-auto border-b border-line bg-page/40 lg:w-64 lg:border-b-0 lg:border-r">
            <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
              {categories.map((item) => {
                const active = category === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`relative whitespace-nowrap rounded-md px-3 py-2.5 text-left text-sm transition-colors lg:whitespace-normal ${
                      active
                        ? 'border-l-4 border-primary bg-primary/10 font-semibold text-primary pl-3'
                        : 'text-ink hover:bg-page'
                    }`}
                  >
                    {item.label}
                    {item.required ? (
                      <span className="text-danger font-bold"> *</span>
                    ) : null}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 overflow-auto">
            {category === 'tables' ? (
              <div className="p-6 md:p-8 space-y-6">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink select-none">
                  <input
                    type="checkbox"
                    checked={isAllTablesSelected}
                    onChange={toggleAllTables}
                    className="size-4 cursor-pointer accent-primary rounded"
                  />
                  <span>All Tables</span>
                </label>

                <div className="flex items-center gap-12 pt-1">
                  {TABLE_NUMBERS.map((tableNo) => {
                    const checked = selectedTables.includes(tableNo)
                    return (
                      <label
                        key={tableNo}
                        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTable(tableNo)}
                          className="size-4 cursor-pointer accent-primary rounded"
                        />
                        <span>{tableNo}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ) : showingReportsOnly ? (
              <div className="grid min-w-[640px] grid-cols-[minmax(0,1.4fr)_120px_130px_160px] gap-3 border-b border-line bg-page px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                <span>{listTitle}</span>
                <span>Action</span>
                <span>Display Values</span>
                <span>Days</span>
              </div>
            ) : (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-line bg-page px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                <span>{listTitle}</span>
                <span className="pr-2 text-right">Action</span>
              </div>
            )}

            {visiblePermissions.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                <Search size={36} strokeWidth={1.5} className="mb-3 text-muted/40" />
                <p className="text-sm font-semibold text-ink">No rights found</p>
                <p className="mt-1 text-xs text-muted">
                  Try another category or search term.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {visiblePermissions.map((item) =>
                  item.kind === 'report' ? (
                    <li
                      key={item.id}
                      className="grid min-w-[640px] grid-cols-[minmax(0,1.4fr)_120px_130px_160px] items-center gap-3 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                        <input
                          type="checkbox"
                          checked={Boolean(reportState[item.id]?.show)}
                          onChange={() =>
                            patchReport(item.id, {
                              show: !reportState[item.id]?.show,
                            })
                          }
                          className="size-4 cursor-pointer accent-primary"
                        />
                        Show
                      </label>
                      <div>
                        {item.hasDisplayValues ? (
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={Boolean(
                                reportState[item.id]?.displayValues,
                              )}
                              onChange={() =>
                                patchReport(item.id, {
                                  displayValues:
                                    !reportState[item.id]?.displayValues,
                                })
                              }
                              className="size-4 cursor-pointer accent-primary"
                            />
                          </label>
                        ) : null}
                      </div>
                      <select
                        value={reportState[item.id]?.days ?? 'No Restriction'}
                        onChange={(event) =>
                          patchReport(item.id, { days: event.target.value })
                        }
                        className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
                      >
                        {REPORT_DAYS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,auto)] sm:items-center sm:gap-4"
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                        {item.label}
                        {item.info ? (
                          <span className="group relative inline-flex">
                            <button
                              type="button"
                              aria-label={`About ${item.label}`}
                              className="inline-flex size-4 items-center justify-center rounded-full text-muted hover:text-primary"
                            >
                              <Info size={13} aria-hidden />
                            </button>
                            <span
                              role="tooltip"
                              className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                            >
                              {item.info}
                            </span>
                          </span>
                        ) : null}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
                        {item.kind === 'yes' ? (
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={Boolean(yesState[item.id])}
                              onChange={() => toggleYes(item.id)}
                              className="size-4 cursor-pointer accent-primary"
                            />
                            Yes
                          </label>
                        ) : null}

                        {item.kind === 'multi'
                          ? item.options.map((option) => {
                              const selected = (
                                multiState[item.id] ?? []
                              ).includes(option)
                              return (
                                <label
                                  key={option}
                                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() =>
                                      toggleMulti(item.id, option)
                                    }
                                    className="size-4 cursor-pointer accent-primary"
                                  />
                                  {option}
                                </label>
                              )
                            })
                          : null}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}