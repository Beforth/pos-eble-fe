import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { LoginForm } from './LoginForm'

export function LoginPage() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row lg:items-stretch">
        {/* Brand panel */}
        <aside className="relative flex flex-col justify-between px-6 pb-4 pt-10 sm:px-10 lg:w-[46%] lg:px-12 lg:py-14">
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
