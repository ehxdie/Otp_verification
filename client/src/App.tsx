import { useState } from 'react'
import PhoneStep from './components/PhoneStep'
import OtpStep from './components/OtpStep'
import VerifiedStep from './components/VerifiedStep'
import './App.css'

export type AppStep = 'phone' | 'otp' | 'verified'

export type OtpSession = {
  tokenId: string
  phoneNumber: string
}

function App() {
  const [step, setStep] = useState<AppStep>('phone')
  const [session, setSession] = useState<OtpSession | null>(null)
  const [verifiedPhone, setVerifiedPhone] = useState<string>('')

  const handleOtpSent = (data: OtpSession) => {
    setSession(data)
    setStep('otp')
  }

  const handleVerified = (phone: string) => {
    setVerifiedPhone(phone)
    setStep('verified')
  }

  const handleReset = () => {
    setSession(null)
    setVerifiedPhone('')
    setStep('phone')
  }

  return (
    <div className="app-wrapper">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="card-container">
        {/* Logo / Brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="brand-name">Verify</span>
        </div>

        {/* Step indicator */}
        <div className="steps-indicator">
          <div className={`step-dot ${step === 'phone' ? 'active' : step !== 'phone' ? 'done' : ''}`} />
          <div className={`step-line ${step === 'otp' || step === 'verified' ? 'filled' : ''}`} />
          <div className={`step-dot ${step === 'otp' ? 'active' : step === 'verified' ? 'done' : ''}`} />
          <div className={`step-line ${step === 'verified' ? 'filled' : ''}`} />
          <div className={`step-dot ${step === 'verified' ? 'active' : ''}`} />
        </div>

        {/* Step content */}
        <div className="step-content">
          {step === 'phone' && (
            <PhoneStep onSuccess={handleOtpSent} />
          )}
          {step === 'otp' && session && (
            <OtpStep
              session={session}
              onSuccess={handleVerified}
              onBack={() => setStep('phone')}
            />
          )}
          {step === 'verified' && (
            <VerifiedStep phone={verifiedPhone} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
