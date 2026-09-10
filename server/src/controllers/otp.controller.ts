import { Request, Response } from "express";
import { sendOTP, verifyOTP } from "../integrations/twillio";
import { HttpStatusCode } from "../exceptions";

export class OtpController {
  /**
   * POST /api/v1/otp/send
   * Body: { phone: string, country: string }
   */
  static async sendOtp(req: Request, res: Response) {
    try {
      const { phone, country } = req.body;

      if (!phone) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "Phone number is required",
        });
      }

      if (!country) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "Country code is required",
        });
      }

      const result = await sendOTP(phone, country);

      if (result.status === "error") {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: (result as any).message || "Failed to send OTP",
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: "ok",
        message: "OTP sent successfully",
        data: {
          tokenId: (result as any).tokenId,
          phoneNumber: (result as any).phoneNumber,
          expiresIn: (result as any).expiresIn,
        },
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.INTERNAL_SERVER).json({
        status: "error",
        message: error?.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/v1/otp/resend
   * Body: { phone: string, country: string }
   */
  static async resendOtp(req: Request, res: Response) {
    try {
      const { phone, country } = req.body;

      if (!phone) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "Phone number is required",
        });
      }

      if (!country) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "Country code is required",
        });
      }

      const result = await sendOTP(phone, country);

      if (result.status === "error") {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: (result as any).message || "Failed to resend OTP",
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: "ok",
        message: "OTP resent successfully",
        data: {
          tokenId: (result as any).tokenId,
          phoneNumber: (result as any).phoneNumber,
          expiresIn: (result as any).expiresIn,
        },
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.INTERNAL_SERVER).json({
        status: "error",
        message: error?.message || "Internal server error",
      });
    }
  }

  /**
   * POST /api/v1/otp/verify
   * Body: { tokenId: string, otp: string }
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, tokenId, otp } = req.body;

      if (!phone) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "Phone number is required for Twilio verification",
        });
      }

      if (!otp) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "OTP code is required",
        });
      }

      const result = await verifyOTP(phone, otp);

      if (result.status === "error") {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: (result as any).message || "OTP verification failed",
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: "ok",
        message: "Phone number verified successfully",
        data: {
          verified: true,
          phoneNumber: (result as any).phoneNumber,
        },
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.INTERNAL_SERVER).json({
        status: "error",
        message: error?.message || "Internal server error",
      });
    }
  }
}
