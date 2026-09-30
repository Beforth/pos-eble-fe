import type { AuthUser } from '../services/authService'

/** True when the signed-in user is an Admin (role code/name or outlet group). */
export function isAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  const roleCode = user.role?.code?.trim().toLowerCase()
  const roleName = user.role?.name?.trim().toLowerCase()
  if (roleCode === 'admin' || roleName === 'admin') return true
  return user.groups.some((group) => group.trim().toLowerCase() === 'admin')
}
