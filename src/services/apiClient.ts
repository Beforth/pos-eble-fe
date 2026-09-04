import { API_BASE_URL } from '../config/api'

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
