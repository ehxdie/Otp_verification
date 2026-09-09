import axios from "axios";

type TermiiSendResponse = {
  pinId: string;
  to: string;
  smsStatus: string;
};

type TermiiVerifyResponse = {
  pinId: string;
  verified: "True" | "False";
  msisdn: string;
  message?: string;
  code?: number;
};

export async function sendWithTermii(
  phone: string, // international phone format
  message?: string,
  duration = 5,
): Promise<TermiiSendResponse> {
  const token = await axios.post(
    `${process.env.TERMII_API_URL}/api/sms/otp/send`,
    {
      api_key: process.env.TERMII_API_KEY,
      message_type: "NUMERIC",
      to: phone,
      from: "N-Alert",
      channel: "dnd",
      pin_attempts: 10,
      pin_time_to_live: duration,
      pin_length: 6,
      pin_placeholder: "< 1234 >",
      message_text:
        message ||
        `Your OTP verification code is < 1234 >. It expires in ${duration} minutes.`,
      pin_type: "NUMERIC",
    },
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    },
  );

  return token.data as TermiiSendResponse;
}

export async function verifyWithTermii(
  token: string,
  sentOTP: string,
): Promise<TermiiVerifyResponse> {
  try {
    const response = await axios.post(
      `${process.env.TERMII_API_URL}/api/sms/otp/verify`,
      {
        api_key: process.env.TERMII_API_KEY,
        pin_id: token,
        pin: sentOTP,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
      },
    );
    return response.data as TermiiVerifyResponse;
  } catch (error) {
    return {
      pinId: token,
      verified: "False",
      // @ts-expect-error axios error data
      msisdn: error?.response?.data?.msisdn || "",
      // @ts-expect-error axios error data
      message: error?.response?.data?.message || "Failed to verify OTP",
      // @ts-expect-error axios error data
      code: error?.response?.data?.status || 500,
    };
  }
}
