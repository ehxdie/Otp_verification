import axios from "axios";

type TermiiSendResponse = {
  pinId: string;
  to: string;
  smsStatus: string;
};

type TermiiVerifyResponse = {
  pinId: string;
  verified: "True" | "False";
  msisdn: string; //"2348109077743"
  message?: string;
  code?: number;
};

export type TermiiEmailResponse = {
  code: string;
  message_id: string;
  message: string;
  balance: number;
  user: string;
};

export async function sendWithTermii(
  phone: string, //international phone format
  message?: string,
  duration = 50,
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
        `Hey there, Getly will like to verify your phone number. Your confirmation code is < 1234 >. The code expires in ${duration} minutes. Get In!`,
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

export async function sendEmailOTP(
  email: string,
  otpCode: string,
): Promise<TermiiEmailResponse> {
  try {
    const response = await axios.post<TermiiEmailResponse>(
      `${process.env.TERMII_API_URL}/api/email/otp/send`,
      {
        email_address: email,
        code: otpCode,
        api_key: process.env.TERMII_API_KEY,
        email_configuration_id: process.env.TERMII_EMAIL_CONFIGURATION_ID,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Error sending OTP:",
        error.message,
        error.response.data.message,
        error.stack,
      );
      throw new Error(
        `API Error: ${error.response.status} - ${error.response.data.message}`,
      );
    } else {
      console.error("Error sending OTP:", error);
      throw new Error(`Unexpected Error: ${error.message}`);
    }
  }
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
      // @ts-expect-error data
      msisdn: error.response.data.msisdn || "",
      // @ts-expect-error data
      message: error.response.data.verified || "Failed to verify OTP",
      // @ts-expect-error data
      code: error.response.data.status || 500,
    };
  }
}
