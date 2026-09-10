import { BadRequestError } from "../../exceptions";
import { sendWithTwilio, verifyWithTwilio } from "./twillio";

type OTPResponse = {
  status: string;
  phoneNumber: string;
  tokenId: string; // Twilio verification SID (for logging/reference only)
  expiresIn: number;
  verified?: boolean;
};

type OTPError = {
  status: string;
  message: unknown;
};

export const OTP_DURATION_MINUTES = 5; // Note: Twilio's default Verify code expiry is 10 min, configurable per Service in console, not per-request

export async function sendOTP(
  phone: string,
  country: string,
): Promise<OTPResponse | OTPError> {
  try {
    if (!phone || !country) {
      throw new Error("Phone number and country are required");
    }

    const response = await sendWithTwilio(phone);

    if (response.status !== "pending") {
      throw new Error("Failed to send OTP");
    }

    return {
      status: response.status,
      phoneNumber: response.to,
      tokenId: response.sid,
      expiresIn: OTP_DURATION_MINUTES * 60,
    };
  } catch (error: any) {
    return {
      status: "error",
      message:
        error?.response?.data?.message || error.message || "Unknown error",
    };
  }
}

// NOTE: unlike Termii, Twilio Verify checks against the PHONE NUMBER + code,
// not a token/pinId. `phone` is required here even though your Termii
// version only needed a token.
export async function verifyOTP(phone: string, sentOTP: string) {
  try {
    if (!phone || !sentOTP) {
      throw new Error("Phone number and OTP are required");
    }

    const response = await verifyWithTwilio(phone, sentOTP);

    if (response.status !== "approved") {
      if (response.status === "error") {
        throw new BadRequestError("Failed to verify OTP");
      }
      throw new Error("OTP verification failed");
    }

    return {
      status: "verified",
      tokenId: response.sid,
      phoneNumber: response.to,
      verified: true,
    };
  } catch (error: any) {
    if (error?.httpCode) {
      return {
        status: "error",
        message: error.message,
        code: error.httpCode,
      };
    }
    return {
      status: "error",
      message: error?.message || "Verification failed",
    };
  }
}
