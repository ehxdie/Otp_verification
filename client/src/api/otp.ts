const API_BASE = 'http://localhost:5000/api/v1'

export type SendOtpPayload = {
  phone: string
  country: string
}

export type SendOtpResponse = {
  status: string
  message: string
  data?: {
    tokenId: string
    phoneNumber: string
    expiresIn: number
  }
}

export type VerifyOtpPayload = {
  tokenId: string
  otp: string
}

export type VerifyOtpResponse = {
  status: string
  message: string
  data?: {
    verified: boolean
    phoneNumber: string
  }
}

async function request<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json?.message || 'Request failed')
  }

  return json as T
}

export function sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
  return request<SendOtpResponse>('/otp/send', payload)
}

export function resendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
  return request<SendOtpResponse>('/otp/resend', payload)
}

export function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>('/otp/verify', payload)
}
