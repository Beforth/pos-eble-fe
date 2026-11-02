import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { LoginForm } from './LoginForm'

/** Food line-art, each about 100 units wide, drawn around its own centre. */
const ICONS = {
  burger: `<path d='M-42 -4c0-26 20-40 42-40s42 14 42 40z'/><circle cx='-16' cy='-26' r='1.5'/><circle cx='2' cy='-32' r='1.5'/><circle cx='18' cy='-24' r='1.5'/><path d='M-46 8c8 6 14-6 22 0s14-6 22 0 14-6 22 0 14-6 22 0'/><path d='M-40 20h80'/><path d='M-42 32c0 8 6 12 14 12h56c8 0 14-4 14-12z'/>`,
  sandwich: `<path d='M-44 28L0 -42l44 70z'/><path d='M-32 10h64'/><path d='M-22 -6h44'/><path d='M-24 16c6 5 10-5 16 0s10-5 16 0 10-5 16 0'/>`,
  dabeli: `<path d='M-46 4c0-24 20-38 46-38s46 14 46 38c0 16-20 28-46 28S-46 20-46 4z'/><path d='M-38 4c10-8 22 4 38-2s28 6 34-2'/><circle cx='-20' cy='16' r='2.5'/><circle cx='-4' cy='20' r='2.5'/><circle cx='12' cy='17' r='2.5'/><circle cx='24' cy='12' r='2.5'/>`,
  panipuri: `<circle cx='-30' cy='-24' r='17'/><ellipse cx='-30' cy='-36' rx='7' ry='3'/><circle cx='26' cy='-18' r='13'/><ellipse cx='26' cy='-28' rx='5.5' ry='2.5'/><path d='M-38 14h76l-9 36h-58z'/><path d='M-30 28h60'/>`,
}

/** [icon, x, y, rotation, scale] - scattered on purpose, no grid. */
const PLACEMENT: [keyof typeof ICONS, number, number, number, number][] = [
  ['burger', 60, 56, -14, 0.5],
  ['panipuri', 205, 38, 12, 0.46],
  ['sandwich', 335, 84, -20, 0.5],
  ['dabeli', 118, 168, 18, 0.48],
  ['sandwich', 262, 190, 9, 0.44],
  ['panipuri', 36, 284, -10, 0.5],
  ['burger', 198, 312, 21, 0.46],
  ['dabeli', 340, 296, -17, 0.5],
  ['burger', 292, 392, 7, 0.42],
  ['dabeli', 82, 408, -24, 0.44],
  ['sandwich', 178, 446, 15, 0.42],
  ['panipuri', 372, 462, -9, 0.44],
  ['sandwich', 44, 130, 33, 0.34],
  ['panipuri', 395, 200, 25, 0.34],
]

function doodles(color: string, opacity: number): string {
  const body = PLACEMENT.map(
    ([icon, x, y, rotation, scale]) =>
      `<g transform='translate(${x} ${y}) rotate(${rotation}) scale(${scale})'>${ICONS[icon]}</g>`,
  ).join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='440' height='500' fill='none' stroke='${color}' stroke-opacity='${opacity}' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'>${body}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const DARK_DOODLES = doodles('white', 0.11)

export function LoginPage() {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-white lg:grid-cols-[3fr_2fr]">
      {/* Brand panel — 60% */}
      <aside
        className="relative flex flex-col justify-between bg-[#2b140f] px-6 pb-10 pt-10 sm:px-10 lg:py-14 lg:pl-[18%] lg:pr-12"
        style={{ backgroundImage: DARK_DOODLES, backgroundPosition: '0 0' }}
      >
        <div className="login-rise relative">
          <div className="inline-flex items-center gap-3">
            <BrandLogo size={64} className="drop-shadow-lg" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                POS
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {brand.shortName}
              </p>
            </div>
          </div>

          <h1 className="mt-10 max-w-md text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:mt-24 lg:text-[3rem]">
            {brand.shopName}
          </h1>
          <p className="mt-3 max-w-md text-base font-medium text-accent sm:text-xl">
            {brand.tagline}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Sign in to manage orders, KOT, and daily operations for your
            outlet.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              Since {brand.established}
            </span>
          </div>
        </div>

        <p className="relative mt-10 hidden text-xs text-white/50 lg:block">
          © {new Date().getFullYear()} {brand.shopName}
        </p>
      </aside>

      {/* Form panel — 40% */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="login-rise-delayed w-full max-w-[420px]">
          {/* Card box commented out; the text and fields stay.
          <div className="rounded-2xl border border-line/80 bg-card/90 p-6 shadow-[0_20px_50px_-24px_rgba(144,65,55,0.35)] backdrop-blur-sm sm:p-8">
          */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-muted">
                Sign in to your POS dashboard.
              </p>
            </div>

            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-muted lg:hidden">
            © {new Date().getFullYear()} {brand.shopName} · {brand.tagline}
          </p>
        </div>
      </main>
    </div>
  )
}
