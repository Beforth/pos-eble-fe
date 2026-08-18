import { liveFloor } from '../../mocks/overviewDashboardData'
import { Card } from '../common/Card'

const statusClass = {
  occupied: 'bg-primary text-white',
  billed: 'bg-accent text-white',
  free: 'bg-page text-muted',
} as const

export function LiveFloorCard() {
  return (
    <Card
      title="Live floor"
      subtitle={`${liveFloor.occupied} running · ${liveFloor.free} free`}
      divider={false}
    >
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-page px-2 py-2">
          <p className="text-lg font-bold text-primary tabular-nums">{liveFloor.occupied}</p>
          <p className="text-[11px] text-muted">Running</p>
        </div>
        <div className="rounded-lg bg-page px-2 py-2">
          <p className="text-lg font-bold text-accent tabular-nums">{liveFloor.billed}</p>
          <p className="text-[11px] text-muted">Billed</p>
        </div>
        <div className="rounded-lg bg-page px-2 py-2">
          <p className="text-lg font-bold text-ink tabular-nums">{liveFloor.free}</p>
          <p className="text-[11px] text-muted">Free</p>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {liveFloor.tables.map((table) => (
          <span
            key={table.no}
            title={`Table ${table.no} · ${table.status}`}
            className={`flex h-8 items-center justify-center rounded-md text-xs font-semibold ${statusClass[table.status]}`}
          >
            {table.no}
          </span>
        ))}
      </div>
    </Card>
  )
}
