import { Router } from "express";
import { OtpController } from "../../controllers/otp.controller";

const router = Router();

/**
 * @swagger
 * /otp/send:
 *   post:
 *     tags:
 *       - OTP
 *     summary: Send OTP to a phone number
 *     description: Sends a 6-digit OTP via SMS to the provided phone number using Termii.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - country
 *             properties:
 *               phone:
 *                 type: string
 *                 description: International format phone number (e.g. +2348012345678)
 *                 example: "+2348012345678"
 *               country:
 *                 type: string
 *                 description: ISO country code (e.g. NG)
 *                 example: "NG"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                       description: Token ID to use when verifying the OTP
 *                     phoneNumber:
 *                       type: string
 *       400:
 *         description: Bad request
 */
router.post("/send", OtpController.sendOtp);

/**
 * @swagger
 * /otp/verify:
 *   post:
 *     tags:
 *       - OTP
 *     summary: Verify OTP code
 *     description: Verifies the OTP code entered by the user using the tokenId returned from /send.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *               - otp
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Token ID returned from the /send endpoint
 *                 example: "c8dcd048-a39d-4532-b2f3-abc12345"
 *               otp:
 *                 type: string
 *                 description: The 6-digit OTP code received via SMS
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Phone number verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     verified:
 *                       type: boolean
 *                       example: true
 *                     phoneNumber:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify", OtpController.verifyOtp);

export default router;
