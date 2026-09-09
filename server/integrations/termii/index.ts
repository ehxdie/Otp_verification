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
  } catch (error) {
    return {
      status: "error",
      message: error,
    };
  }
}

export async function verifyOTP(token: string, sentOTP: string) {
  try {
    if (!token || !sentOTP) {
      throw new Error("Token and OTP are required");
    }
    const response = await verifyWithTermii(token, sentOTP);

    if (!response.verified) {
      if (response.code === 400) {
        throw new BadRequestError(response.message || "Failed to verify OTP");
      }
      throw new Error(response.message);
    }

    return {
      status: response.verified ? "verified" : "not verified",
      tokenId: response.pinId,
      phoneNumber: response.msisdn,
      verified: response.verified,
    };
  } catch (error: any) {
    console.log(error);
    if (error?.code) {
      return {
        status: "error",
        message: error.message,
        code: error.code,
      };
    }
    return {
      status: "error",
      message: error,
    };
  }
}
