// controllers/otpController.ts
import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../common/errors/api.error";
import { AppDataSource } from "../config/data_source";
import { Otp } from "../entities/otp";


const otpRepository = AppDataSource.getRepository(Otp)

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Phone is required" });
    }

    const otpCode = "0000";
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await otpRepository.delete({ phone });

    const otpEntry = otpRepository.create({ phone, otp: otpCode, expiry });
    await otpRepository.save(otpEntry);

    res.status(HttpStatusCode.OK).json({ message: "OTP sent successfully", phone });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Phone and OTP are required" });
    }

    const otpEntry = await otpRepository.findOne({ where: { phone } });
    if (!otpEntry) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "No OTP found for this phone" });
    }

    if (otpEntry.expiry < new Date()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "OTP expired" });
    }

    if (otpEntry.otp !== otp) {
      otpEntry.attempts += 1;
      await otpRepository.save(otpEntry);
      return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid OTP" });
    }

    await otpRepository.delete({ phone });

    res.status(HttpStatusCode.OK).json({ message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};

