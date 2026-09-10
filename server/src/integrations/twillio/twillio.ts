import path from "node:path";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export function getTwilioConfig() {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID ||
    process.env.TWILLIO_SID ||
    process.env.TWILIO_SID ||
    "";

  const authToken =
    process.env.TWILIO_AUTH_TOKEN ||
    process.env.AUTH_TOKEN ||
    process.env.TWILIO_TOKEN ||
    "";

  const serviceSid =
    process.env.TWILIO_VERIFY_SERVICE_SID ||
    process.env.TWILLIO_VERIFY_SERVICE_SID ||
    process.env.TWILIO_SERVICE_SID ||
    "";

  if (!accountSid || !authToken) {
    throw new Error(
      "Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in the server .env file.",
    );
  }

  return { accountSid, authToken, serviceSid };
}

const getClient = () => {
  const { accountSid, authToken } = getTwilioConfig();
  return twilio(accountSid, authToken);
};

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
  const { serviceSid } = getTwilioConfig();

  if (!serviceSid) {
    throw new Error(
      "Missing TWILIO_VERIFY_SERVICE_SID in the server .env file.",
    );
  }

  const verification = await getClient()
    .verify.v2.services(serviceSid)
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
    const { serviceSid } = getTwilioConfig();

    if (!serviceSid) {
      throw new Error(
        "Missing TWILIO_VERIFY_SERVICE_SID in the server .env file.",
      );
    }

    const check = await getClient()
      .verify.v2.services(serviceSid)
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
