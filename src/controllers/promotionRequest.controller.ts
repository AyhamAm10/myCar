import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { PromotionRequest, TypePromotion } from "../entities/promotion-request";
import { APIError, HttpStatusCode } from "../common/errors/api.error";
import { ApiResponse } from "../common/responses/api.response";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { Car } from "../entities/car";
import { User } from "../entities/user";

const promotionRequestRepo = AppDataSource.getRepository(PromotionRequest);
const carRepo = AppDataSource.getRepository(Car);
const userRepo = AppDataSource.getRepository(User);

export class PromotionRequestController {
  static async createAccountVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "طلب التوثيق" : "verification request";

      if (!userId) {
        throw new APIError(
          HttpStatusCode.UNAUTHORIZED,
          ErrorMessages.generateErrorMessage(entity, "unauthorized", lang)
        );
      }

      const request = promotionRequestRepo.create({
        userId,
        requestType: TypePromotion.account,
      });

      await promotionRequestRepo.save(request);

      return res
        .status(HttpStatusCode.CREATED)
        .json(
          ApiResponse.success(
            request,
            ErrorMessages.generateErrorMessage(entity, "created", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async createListingPromotionRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const { carId } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "طلب الترقية" : "promotion request";

      if (!userId || !carId) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(entity, "missing fields", lang)
        );
      }

      const request = promotionRequestRepo.create({
        userId,
        carId,
        requestType: TypePromotion.listing,
      });

      await promotionRequestRepo.save(request);

      return res
        .status(HttpStatusCode.CREATED)
        .json(
          ApiResponse.success(
            request,
            ErrorMessages.generateErrorMessage(entity, "created", lang)
          )
        );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getAllRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلبات" : "requests";

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [requests, total] = await promotionRequestRepo.findAndCount({
        relations: ["user", "car"],
        skip: offset,
        take: limit,
        order: { createdAt: "DESC" },
      });

      return res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          {
            items: requests,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          },
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateRequestStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { status, type, adminNotes } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلب" : "request";

      const validStatuses = ["approved", "rejected"];
      if (!validStatuses.includes(status)) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage("status", "invalid", lang)
        );
      }

      const request = await promotionRequestRepo.findOne({
        where: { id: Number(id) },
        relations: ["car", "user"],
      });

      if (!request) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      request.status = status;
      request.adminNotes = adminNotes || null;

      await promotionRequestRepo.save(request);

      if (status == "approved") {
        if (type == "car") {
          const car = await carRepo.findOneBy({ id: request.carId });
          if (!car) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage("car", "not found", lang)
            );
          }
          car.isVerified = true;
          await carRepo.save(car);
        } else if (type == "user") {
          const user = await userRepo.findOneBy({ id: request.userId });
          if (!user) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage("user", "not found", lang)
            );
          }
          user.verified = true;
          await userRepo.save(user);
        }
      }

      if (status == "rejected") {
        if (type == "car") {
          const car = await carRepo.findOneBy({ id: request.carId });
          if (!car) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage("car", "not found", lang)
            );
          }
          car.isVerified = false;
          await carRepo.save(car);
        } else if (type == "user") {
          const user = await userRepo.findOneBy({ id: request.userId });
          if (!user) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage("car", "not found", lang)
            );
          }
          user.verified = false;
          await userRepo.save(user);
        }
      }

      return res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            request,
            ErrorMessages.generateErrorMessage(entity, "updated", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async deleteRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلب" : "request";

      const request = await promotionRequestRepo.findOne({
        where: { id: +id },
        relations: ["car", "user"],
      });

      if (!request) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      await promotionRequestRepo.remove(request);
      return res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            null,
            ErrorMessages.generateErrorMessage(entity, "deleted", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
