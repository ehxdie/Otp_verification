import { Response } from "express";
import { BaseError } from "../exceptions";

class ErrorHandler {
  public async handleError(err: Error, res?: Response): Promise<void> {
    console.error("Error:", err.message, err.stack);

    if (err instanceof BaseError) {
      if (res) {
        res.status(err.httpCode).json({ status: "fail", message: err.message });
      }
    }
  }

  public isTrustedError(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isOperational;
    }
    return false;
  }
}

export const errorHandler = new ErrorHandler();
