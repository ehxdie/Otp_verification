import twilio from "twilio";

const accountSid =
  process.env.TWILIO_ACCOUNT_SID ||
  process.env.TWILLIO_SID ||
  process.env.TWILIO_SID;

const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.AUTH_TOKEN;

const VERIFY_SERVICE_SID =
  process.env.TWILIO_VERIFY_SERVICE_SID ||
  process.env.TWILLIO_VERIFY_SERVICE_SID ||
  "";

const client = twilio(accountSid, authToken);

type TwilioSendResponse = {
  sid: string;
  to: string;
  status: string; // "pending", "approved", "canceled", etc.
};

type TwilioVerifyResponse = {
  sid: string;
  status: string; // "approved" if correct, "pending" if not
  to: string;
  valid: boolean;
};

export async function sendWithTwilio(
  phone: string, // must be E.164 format, e.g. +2347085108384
): Promise<TwilioSendResponse> {
  const verification = await client.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verifications.create({ to: phone, channel: "sms" });

  return {
    sid: verification.sid,
    to: verification.to,
    status: verification.status,
  };
}

export async function verifyWithTwilio(
  phone: string,
  code: string,
): Promise<TwilioVerifyResponse> {
  try {
    const check = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    return {
      sid: check.sid,
      status: check.status,
      to: check.to,
      valid: check.valid,
    };
  } catch (error: any) {
    return {
      sid: "",
      status: "error",
      to: phone,
      valid: false,
    };
  }
}
