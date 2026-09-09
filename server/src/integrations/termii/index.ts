import { BadRequestError } from "../../exceptions";
import { sendWithTermii, verifyWithTermii } from "./termii";

type OTPResponse = {
  status: string;
  phoneNumber: string;
  tokenId: string;
  verified?: boolean;
};
type OTPError = {
  status: string;
  message: unknown;
};

export async function sendOTP(
  phone: string,
  country: string,
): Promise<OTPResponse | OTPError> {
  try {
    if (!phone || !country) {
      throw new Error("Phone number and country are required");
    }
    const response = await sendWithTermii(phone);

    if (response.smsStatus !== "Message Sent") {
      throw new Error("Failed to send OTP");
    }

    return {
      status: response.smsStatus,
      phoneNumber: response.to,
      tokenId: response.pinId,
    };
  } catch (error: any) {
    return {
      status: "error",
      message:
        error?.response?.data?.message || error.message || "Unknown error",
    };
  }
}

export async function verifyOTP(token: string, sentOTP: string) {
  try {
    if (!token || !sentOTP) {
      throw new Error("Token and OTP are required");
    }
    const response = await verifyWithTermii(token, sentOTP);

    if (response.verified !== "True") {
      if (response.code === 400) {
        throw new BadRequestError(response.message || "Failed to verify OTP");
      }
      throw new Error(response.message || "OTP verification failed");
    }

    return {
      status: "verified",
      tokenId: response.pinId,
      phoneNumber: response.msisdn,
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
