import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent, type FormEvent } from 'react'
import { verifyOtp, resendOtp } from '../api/otp'
import type { OtpSession } from '../App'

type Props = {
  session: OtpSession
  onTokenChange: (tokenId: string) => void
  onSuccess: (phone: string) => void
  onBack: () => void
}

const OTP_LENGTH = 6

export default function OtpStep({ session, onTokenChange, onSuccess, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(session.expiresIn)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const resendLocked = seconds > 0

  const updateDigit = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      const next = [...digits]
      next[index] = ''
      setDigits(next)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = Array(OTP_LENGTH).fill('')
    text.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const otp = digits.join('')
    if (otp.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`)
      return
    }

    setLoading(true)
    try {
      const res = await verifyOtp({ tokenId: session.tokenId, otp })

      if (res.status === 'ok' && res.data?.verified) {
        onSuccess(res.data.phoneNumber || session.phoneNumber)
      } else {
        setError(res.message || 'Invalid code. Please try again.')
        setDigits(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.')
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResending(true)
    try {
      const res = await resendOtp({
        phone: session.phoneNumber,
        country: session.country,
      })

      if (res.status === 'ok' && res.data) {
        setDigits(Array(OTP_LENGTH).fill(''))
        onTokenChange(res.data.tokenId)
        inputRefs.current[0]?.focus()
      } else {
        setError(res.message || 'Failed to resend code. Please try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const maskedPhone = session.phoneNumber
    ? session.phoneNumber.replace(/(\d{3})\d+(\d{4})$/, '$1****$2')
    : 'your phone'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div className="step-panel" id="otp-step">
      <div className="step-icon-wrap">
        <div className="step-icon otp-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <h1 className="step-title">Enter your code</h1>
      <p className="step-description">
        We sent a 6-digit code to <strong>{maskedPhone}</strong>.
        Check your messages and enter it below.
      </p>

      <div className={`otp-expiry ${seconds <= 30 ? 'expiring' : ''}`} id="otp-expiry">
        {seconds > 0 ? (
          <>
            <span className="expiry-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            Code expires in <strong>{timeLabel}</strong>
          </>
        ) : (
          <>
            <span className="expiry-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
              </svg>
            </span>
            Code expired. Request a new one below.
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form otp-form" id="otp-form">
        <div className="otp-boxes" role="group" aria-label="OTP input">
          {digits.map((d, i) => (
            <input
              key={i}
              id={`otp-digit-${i}`}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`otp-box ${d ? 'filled' : ''}`}
              value={d}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              autoFocus={i === 0}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <div className="error-box" role="alert" id="otp-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          id="verify-otp-btn"
          className={`primary-btn ${loading ? 'loading' : ''}`}
          disabled={loading || digits.join('').length < OTP_LENGTH}
        >
          {loading ? (
            <><span className="spinner" /> Verifying…</>
          ) : (
            <>Verify Code <span className="btn-arrow">→</span></>
          )}
        </button>

        <div className="resend-row">
          <span className="resend-hint">Didn't receive the code?</span>
          <button
            type="button"
            id="resend-btn"
            className="resend-btn"
            onClick={handleResend}
            disabled={resendLocked || resending || loading}
          >
            {resending ? (
              <><span className="spinner spinner-dark" /> Resending…</>
            ) : resendLocked ? (
              <>Resend in {timeLabel}</>
            ) : (
              <>Resend Code</>
            )}
          </button>
        </div>

        <button
          type="button"
          id="back-btn"
          className="ghost-btn"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to phone number
        </button>
      </form>
    </div>
  )
}
