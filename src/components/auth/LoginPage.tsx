import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { LoginForm } from './LoginForm'

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-page">
      {/* Ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,color-mix(in_srgb,var(--color-surface-tint)_55%,transparent),transparent_50%),radial-gradient(ellipse_at_85%_15%,color-mix(in_srgb,var(--color-primary)_12%,transparent),transparent_45%),radial-gradient(ellipse_at_70%_90%,color-mix(in_srgb,var(--color-secondary)_28%,transparent),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(color-mix(in_srgb,var(--color-line)_80%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-line)_80%,transparent)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row lg:items-stretch">
        {/* Brand panel */}
        <aside className="relative flex flex-col justify-between px-6 pb-4 pt-10 sm:px-10 lg:w-[46%] lg:px-12 lg:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 top-24 size-56 rounded-full bg-primary/10 blur-3xl login-float"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-20 right-4 size-40 rounded-full bg-accent/15 blur-3xl login-float-delayed"
          />

          <div className="login-rise relative">
            <div className="inline-flex items-center gap-3">
              <BrandLogo size={56} className="drop-shadow-sm" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  POS
                </p>
                <p className="truncate text-sm font-semibold text-deep">
                  {brand.shortName}
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-sm text-3xl font-bold leading-tight tracking-tight text-deep sm:text-4xl lg:mt-16 lg:text-[2.75rem]">
              {brand.shopName}
            </h1>
            <p className="mt-3 max-w-sm text-base font-medium text-accent sm:text-lg">
              {brand.tagline}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Sign in to manage orders, KOT, and daily operations for your
              outlet.
            </p>

            <div className="mt-8 hidden items-center gap-3 lg:flex">
              <span className="h-px w-8 bg-primary" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Since {brand.established}
              </span>
            </div>
          </div>

          <p className="relative mt-10 hidden text-xs text-muted lg:block">
            © {new Date().getFullYear()} {brand.shopName}
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="login-rise-delayed w-full max-w-[420px]">
            <div className="rounded-2xl border border-line/80 bg-card/90 p-6 shadow-[0_20px_50px_-24px_rgba(144,65,55,0.35)] backdrop-blur-sm sm:p-8">
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
    </div>
  )
}
