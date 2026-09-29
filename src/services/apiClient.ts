import { API_BASE_URL } from '../config/api'
import { clearAuthStorage } from '../auth/storage'

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors: unknown
}

export class ApiError extends Error {
  status: number
  errors: unknown

  constructor(message: string, status: number, errors: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  token?: string
  headers?: Record<string, string>
}

/**
 * Terminate the current session and land on the login screen.
 * Called whenever any API responds 401 (expired/invalid credentials).
 */
function handleUnauthorized(): void {
  clearAuthStorage()
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...init } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(extraHeaders ?? {}),
  }

  if (init.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check that the API is running.',
      0,
    )
  }

  if (response.status === 401) {
    handleUnauthorized()
  }

  let envelope: ApiEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError('Unexpected server response.', response.status)
  }

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.message || 'Request failed.',
      response.status,
      envelope.errors,
    )
  }

  return envelope.data
}

/** DRF paginated list response (used by items, commissions, trigger-logs). */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Fetch a DRF paginated list endpoint. These responses are NOT wrapped in the
 * standard envelope — they are `{count, next, previous, results}`.
 */
export async function paginatedApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Paginated<T>> {
  const { token, headers: extraHeaders, ...init } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(extraHeaders ?? {}),
  }

  if (init.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check that the API is running.',
      0,
    )
  }

  if (response.status === 401) {
    handleUnauthorized()
  }

  type PaginatedBody = Paginated<T> & { detail?: string }
  let body: PaginatedBody | null = null
  try {
    body = (await response.json()) as PaginatedBody
  } catch {
    throw new ApiError('Unexpected server response.', response.status)
  }

  if (!response.ok || body == null || !Array.isArray(body.results)) {
    throw new ApiError(body?.detail || 'Request failed.', response.status)
  }

  return body
}

type MultipartRequestOptions = Omit<RequestInit, 'headers' | 'body'> & {
  token?: string
  headers?: Record<string, string>
}

/**
 * Send a multipart/form-data request. Content-Type must NOT be set manually:
 * the browser derives the boundary from the FormData body.
 */
export async function multipartApiRequest<T>(
  path: string,
  body: FormData,
  options: MultipartRequestOptions = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...init } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(extraHeaders ?? {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      body,
      headers,
    })
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check that the API is running.',
      0,
    )
  }

  if (response.status === 401) {
    handleUnauthorized()
  }

  let envelope: ApiEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError('Unexpected server response.', response.status)
  }

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.message || 'Request failed.',
      response.status,
      envelope.errors,
    )
  }

  return envelope.data
}
