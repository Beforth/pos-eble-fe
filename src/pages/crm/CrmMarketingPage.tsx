import { useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  Eye,
  FileSpreadsheet,
  Info,
  Lock,
  Megaphone,
  MoreVertical,
  Plus,
  RefreshCw,
  Rocket,
} from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

export default function CrmMarketingPage() {
  const [userCount, setUserCount] = useState(191)
  const [isRefreshing, setIsRefreshing] = useState(false)

  function handleRefresh() {
    setIsRefreshing(true)
    setTimeout(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3))
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <ReportsPageShell title="Marketing" activeItem="crm-marketing">
      <div className="space-y-6">
        {/* Announcement Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/15 bg-primary/5 p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Rocket size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-extrabold text-white uppercase">
                  New
                </span>
                <h3 className="text-sm font-bold text-ink">
                  Marketing Has Moved To Marketing Automation
                </h3>
              </div>
              <p className="mt-1 text-xs font-medium text-muted">
                Manage channels, segments, and campaigns from one unified portal — with smarter automation and deeper insights.
              </p>
            </div>
          </div>

          <OutlineButton
            variant="gray"
            onClick={() => alert('Navigating to Marketing Automation...')}
          >
            Explore Now
          </OutlineButton>
        </div>

        {/* Page Title & Lock Button */}
        <div className="flex items-center justify-between">
          <div />

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-bold text-success shadow-xs hover:bg-success/15 transition-colors"
          >
            <Lock size={14} />
            <span>Unlock</span>
          </button>
        </div>

        {/* 3 Step Wizard Flow Box */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
          {/* Left Step Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Step 1 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-muted">
                STEP 1
              </span>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink shadow-xs hover:bg-page transition-colors"
              >
                <Plus size={14} className="text-primary" />
                <span>Add Channel</span>
                <ChevronDown size={12} className="text-muted" />
              </button>
            </div>

            {/* Step 2 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-muted">
                STEP 2
              </span>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink shadow-xs hover:bg-page transition-colors"
              >
                <span>Create Segment</span>
                <ArrowRight size={14} className="text-muted" />
              </button>
            </div>

            {/* Step 3 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-muted">
                STEP 3
              </span>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink shadow-xs hover:bg-page transition-colors"
              >
                <span>Create Campaign</span>
                <ArrowRight size={14} className="text-muted" />
              </button>
            </div>
          </div>

          {/* Right Action Button */}
          <PrimaryButton onClick={() => alert('Opening campaigns...')}>
            View Campaign
          </PrimaryButton>
        </div>

        {/* Segment Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: All Users */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-card p-5 shadow-sm transition-all hover:shadow-md">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">All Users</h3>
              <div className="flex items-center gap-2 text-muted">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded p-1 hover:bg-page hover:text-primary transition-colors"
                  title="Refresh users"
                >
                  <RefreshCw
                    size={15}
                    className={isRefreshing ? 'animate-spin text-primary' : ''}
                  />
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-page hover:text-primary transition-colors"
                  title="Segment Info"
                >
                  <Info size={15} />
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-page hover:text-primary transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>

            {/* Center User Count Display */}
            <div className="my-8 text-center">
              <span className="text-4xl font-black tracking-tight text-ink">
                {userCount}
              </span>
              <p className="mt-1 text-xs font-semibold text-muted">Users</p>
            </div>

            {/* Bottom Action Links Bar */}
            <div className="flex items-center justify-around border-t border-line pt-4 text-xs font-bold text-ink">
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Eye size={14} className="text-muted" />
                <span>View</span>
              </button>

              <div className="h-4 w-px bg-line" />

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <FileSpreadsheet size={14} className="text-muted" />
                <span>Excel</span>
              </button>

              <div className="h-4 w-px bg-line" />

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Megaphone size={14} className="text-muted" />
                <span>Campaign</span>
              </button>
            </div>
          </div>

          {/* Card 2: Add Segment */}
          <div
            onClick={() => alert('Add segment clicked')}
            className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-card p-6 text-center shadow-xs transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs">
              <Plus size={28} className="text-primary" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-ink">Add Segment</h3>

            <p className="mt-1 max-w-[200px] text-xs font-medium text-muted leading-relaxed">
              Please Choose Your Users By Selecting Various Criteria
            </p>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
