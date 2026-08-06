/*
 * Auth API layer.
 *
 * Currently mocked — swap `loginApi` with a real fetch call without
 * touching any component code.
 */

export interface LoginCredentials {
  identifier: string
  password: string
  outletId?: string
}

export interface AuthUser {
  name: string
  identifier: string
  outlet: string
}

export interface LoginResult {
  token: string
  user: AuthUser
}

const MOCK_TOKEN = 'rajubhai-mock-token-1987'
const MOCK_USER: AuthUser = {
  name: 'Rajubhai',
  identifier: 'rajubhai@annapurna.in',
  outlet: "Annapurna's Rajubhai Dabeliwale — Dadar",
}

export async function loginApi(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  // TODO: Replace with a real API call, e.g.
  //   const res = await fetch('/api/auth/login', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(credentials),
  //   })
  //   if (!res.ok) throw new Error('Invalid credentials')
  //   return res.json()

  await new Promise((resolve) => setTimeout(resolve, 900))

  if (!credentials.identifier.trim() || credentials.password.trim().length < 4) {
    throw new Error('Invalid username or password. Please try again.')
  }

  return { token: MOCK_TOKEN, user: MOCK_USER }
}
