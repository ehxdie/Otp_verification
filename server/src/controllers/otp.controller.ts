import { Request, Response } from "express";
import { sendOTP, verifyOTP } from "../integrations/termii";
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
      const { tokenId, otp } = req.body;

      if (!tokenId) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "Token ID is required",
        });
      }

      if (!otp) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: "fail",
          message: "OTP code is required",
        });
      }

      const result = await verifyOTP(tokenId, otp);

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
