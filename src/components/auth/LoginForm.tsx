import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, LogIn, Store, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

interface LoginFormProps {
  multiOutlet?: boolean
}

interface FieldErrors {
  identifier?: string
  password?: string
  outletId?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,}$/

export function LoginForm({ multiOutlet = true }: LoginFormProps) {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [outletId, setOutletId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

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

    if (multiOutlet && !outletId.trim()) {
      next.outletId = 'Outlet ID is required for multi-outlet login.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    try {
      await login({
        identifier: identifier.trim(),
        password,
        outletId: outletId.trim() || undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p
          role="alert"
          className="rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary"
        >
          {formError}
        </p>
      )}

      {multiOutlet && (
        <Input
          label="Outlet ID"
          value={outletId}
          onChange={(event) => setOutletId(event.target.value)}
          error={errors.outletId}
          leftIcon={<Store size={16} />}
          placeholder="e.g. RD-DADAR-0421"
          autoComplete="organization"
        />
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
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="rounded-md p-1.5 text-muted transition-colors hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="flex justify-end">
        <a
          href="#forgot-password"
          onClick={(event) => event.preventDefault()}
          className="text-xs font-medium text-primary hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        icon={!loading ? <LogIn size={16} /> : undefined}
      >
        Sign In
      </Button>
    </form>
  )
}
