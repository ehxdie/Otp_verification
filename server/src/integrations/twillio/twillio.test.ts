import test from "node:test";
import assert from "node:assert/strict";

import { getTwilioConfig } from "./twillio";

test("getTwilioConfig rejects missing Twilio credentials with a clear error", () => {
  const previousAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const previousTwilioSid = process.env.TWILLIO_SID;
  const previousAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const previousLegacyAuthToken = process.env.AUTH_TOKEN;
  const previousVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const previousLegacyVerifyServiceSid = process.env.TWILLIO_VERIFY_SERVICE_SID;

  try {
    process.env.TWILIO_ACCOUNT_SID = "";
    process.env.TWILLIO_SID = "";
    process.env.TWILIO_AUTH_TOKEN = "";
    process.env.AUTH_TOKEN = "";
    process.env.TWILIO_VERIFY_SERVICE_SID = "";
    process.env.TWILLIO_VERIFY_SERVICE_SID = "";

    assert.throws(
      () => getTwilioConfig(),
      /TWILIO_ACCOUNT_SID.*TWILIO_AUTH_TOKEN/i,
    );
  } finally {
    if (previousAccountSid) process.env.TWILIO_ACCOUNT_SID = previousAccountSid;
    else delete process.env.TWILIO_ACCOUNT_SID;
    if (previousTwilioSid) process.env.TWILLIO_SID = previousTwilioSid;
    else delete process.env.TWILLIO_SID;
    if (previousAuthToken) process.env.TWILIO_AUTH_TOKEN = previousAuthToken;
    else delete process.env.TWILIO_AUTH_TOKEN;
    if (previousLegacyAuthToken)
      process.env.AUTH_TOKEN = previousLegacyAuthToken;
    else delete process.env.AUTH_TOKEN;
    if (previousVerifyServiceSid)
      process.env.TWILIO_VERIFY_SERVICE_SID = previousVerifyServiceSid;
    else delete process.env.TWILIO_VERIFY_SERVICE_SID;
    if (previousLegacyVerifyServiceSid)
      process.env.TWILLIO_VERIFY_SERVICE_SID = previousLegacyVerifyServiceSid;
    else delete process.env.TWILLIO_VERIFY_SERVICE_SID;
  }
});
