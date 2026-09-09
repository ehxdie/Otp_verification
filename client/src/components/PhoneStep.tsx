import { useState, type FormEvent } from 'react'
import { sendOtp } from '../api/otp'
import type { OtpSession } from '../App'

type Props = {
  onSuccess: (session: OtpSession) => void
}

const COUNTRY_CODES = [
  { code: 'NG', dial: '+234', label: '🇳🇬 Nigeria' },
  { code: 'GH', dial: '+233', label: '🇬🇭 Ghana' },
  { code: 'KE', dial: '+254', label: '🇰🇪 Kenya' },
  { code: 'ZA', dial: '+27', label: '🇿🇦 South Africa' },
  { code: 'US', dial: '+1', label: '🇺🇸 United States' },
  { code: 'GB', dial: '+44', label: '🇬🇧 United Kingdom' },
]

export default function PhoneStep({ onSuccess }: Props) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }

    const fullPhone = `${selectedCountry.dial}${phone.replace(/^0+/, '').replace(/\D/g, '')}`

    setLoading(true)
    try {
      const res = await sendOtp({ phone: fullPhone, country: selectedCountry.code })

      if (res.status === 'ok' && res.data) {
        onSuccess({
          tokenId: res.data.tokenId,
          phoneNumber: res.data.phoneNumber,
        })
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="step-panel" id="phone-step">
      <div className="step-icon-wrap">
        <div className="step-icon phone-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <h1 className="step-title">Verify your phone</h1>
      <p className="step-description">
        We'll send a 6-digit code to your mobile number to confirm it's really you.
      </p>

      <form onSubmit={handleSubmit} className="input-form" id="phone-form">
        <label className="field-label" htmlFor="country-select">Country</label>
        <div className="select-wrapper">
          <select
            id="country-select"
            className="field-select"
            value={selectedCountry.code}
            onChange={(e) => {
              const c = COUNTRY_CODES.find(c => c.code === e.target.value)!
              setSelectedCountry(c)
            }}
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code}>{c.label} ({c.dial})</option>
            ))}
          </select>
          <span className="select-arrow">▾</span>
        </div>

        <label className="field-label" htmlFor="phone-input">Phone number</label>
        <div className="phone-input-wrap">
          <span className="dial-badge">{selectedCountry.dial}</span>
          <input
            id="phone-input"
            type="tel"
            className="field-input phone-input"
            placeholder="8012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        {error && (
          <div className="error-box" role="alert" id="phone-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          id="send-otp-btn"
          className={`primary-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Sending…</>
          ) : (
            <>Send Code <span className="btn-arrow">→</span></>
          )}
        </button>
      </form>
    </div>
  )
}
