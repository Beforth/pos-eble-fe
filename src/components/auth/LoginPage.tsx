import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { LoginForm } from './LoginForm'

interface LoginPageProps {
  multiOutlet?: boolean
}

export function LoginPage({ multiOutlet = true }: LoginPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-surface-tint/60 via-card to-page px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo size={76} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-deep">
            {brand.shopName}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-accent">
            {brand.tagline}
          </p>
          <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-muted">
            Since {brand.established}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-8">
          <h2 className="text-lg font-semibold text-ink">Welcome back</h2>
          <p className="mb-5 mt-0.5 text-sm text-muted">
            Sign in to your POS dashboard.
          </p>
          <LoginForm multiOutlet={multiOutlet} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {brand.shopName} · {brand.tagline}
        </p>
      </div>
    </div>
  )
}
