type Props = {
  phone: string
  onReset: () => void
}

export default function VerifiedStep({ phone, onReset }: Props) {
  return (
    <div className="step-panel verified-panel" id="verified-step">
      <div className="success-animation">
        <div className="checkmark-ring">
          <svg
            className="checkmark-svg"
            viewBox="0 0 52 52"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
      </div>

      <h1 className="step-title verified-title">Verified!</h1>
      <p className="step-description">
        Your phone number{' '}
        <strong className="verified-phone">{phone}</strong>
        {' '}has been successfully verified.
      </p>

      <div className="verified-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        Identity confirmed
      </div>

      <button
        id="restart-btn"
        type="button"
        className="ghost-btn"
        onClick={onReset}
        style={{ marginTop: '2rem' }}
      >
        ← Verify another number
      </button>
    </div>
  )
}
