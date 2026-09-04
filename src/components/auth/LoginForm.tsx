import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, LogIn, Store, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  OutletSelectionRequiredError,
  type OutletMembership,
} from '../../services/authService'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

interface FieldErrors {
  identifier?: string
  password?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,}$/

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [outletChoices, setOutletChoices] = useState<OutletMembership[] | null>(
    null,
  )
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null)

  const validate = (): boolean => {
    const next: FieldErrors = {}
    const value = identifier.trim()

    if (!value) {
      next.identifier = 'Username, phone or email is required.'
    } else if (
      !EMAIL_RE.test(value) &&
      !PHONE_RE.test(value) &&
      !USERNAME_RE.test(value)
    ) {
      next.identifier = 'Enter a valid email, phone or username.'
    }

    if (!password) {
      next.password = 'Password is required.'
    } else if (password.length < 4) {
      next.password = 'Password must be at least 4 characters.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const completeLogin = async (outletId?: number) => {
    await login({
      identifier: identifier.trim(),
      password,
      outletId,
    })
    navigate('/dashboard', { replace: true })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    try {
      if (outletChoices && selectedOutletId != null) {
        await completeLogin(selectedOutletId)
        return
      }
      await completeLogin()
    } catch (err) {
      if (err instanceof OutletSelectionRequiredError) {
        setOutletChoices(err.outlets)
        setSelectedOutletId(err.outlets[0]?.outletId ?? null)
        setFormError('Select an outlet to continue.')
      } else {
        setFormError(
          err instanceof Error
            ? err.message
            : 'Login failed. Please try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-primary/15 bg-primary/10 px-3.5 py-3 text-xs font-medium leading-relaxed text-primary"
        >
          {formError}
        </p>
      )}

      <Input
        label="Username / Phone / Email"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        error={errors.identifier}
        leftIcon={<User size={16} />}
        placeholder="you@restaurant.in or +91..."
        autoComplete="username"
        autoFocus
        className="h-11 rounded-xl"
        disabled={Boolean(outletChoices)}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        leftIcon={<Lock size={16} />}
        placeholder="Enter your password"
        autoComplete="current-password"
        className="h-11 rounded-xl"
        disabled={Boolean(outletChoices)}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {outletChoices && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Outlet</span>
          <div className="relative">
            <Store
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={selectedOutletId ?? ''}
              onChange={(event) =>
                setSelectedOutletId(Number(event.target.value))
              }
              className="h-11 w-full rounded-xl border border-line bg-white py-2 pl-10 pr-3 text-sm text-ink outline-none focus:border-primary"
            >
              {outletChoices.map((outlet) => (
                <option key={outlet.outletId} value={outlet.outletId}>
                  {outlet.outletName}
                </option>
              ))}
            </select>
          </div>
        </label>
      )}

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        icon={!loading ? <LogIn size={16} /> : undefined}
        className="mt-1 h-12 rounded-xl text-[15px] shadow-[0_8px_20px_-8px_rgba(255,9,23,0.55)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {outletChoices ? 'Continue' : 'Sign In'}
      </Button>
    </form>
  )
}
