// src/controllers/favorite.controller.ts

import { Request, Response, NextFunction } from "express";
import { Favorite } from "../entities/favorite";
import { Car } from "../entities/car";
import { AppDataSource } from "../config/data_source";
import { APIError, HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { ApiResponse } from "../common/responses/api.response";

const favoriteRepository = AppDataSource.getRepository(Favorite);
const carRepository = AppDataSource.getRepository(Car);

class FavoriteController {
  async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { carId } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المفضلة" : "favorite";

      if (!userId || !carId) {
        return next(new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(entity, "missing fields", lang)
        ));
      }

      const car = await carRepository.findOne({ where: { id: carId } });
      if (!car) {
        return next(new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("car", "not found", lang)
        ));
      }

      const existing = await favoriteRepository.findOne({ where: { userId, carId } });

      if (existing) {
        await favoriteRepository.remove(existing);
        return res.status(HttpStatusCode.OK).json(
          ApiResponse.success(null, ErrorMessages.generateErrorMessage(entity, "updated", lang))
        );
      }

      const newFavorite = favoriteRepository.create({ userId, carId });
      await favoriteRepository.save(newFavorite);

      return res.status(HttpStatusCode.CREATED).json(
        ApiResponse.success(newFavorite, ErrorMessages.generateErrorMessage(entity, "updated", lang))
      );
    } catch (error) {
      return next(error);
    }
  }

  async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المفضلة" : "favorite";

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      if (!userId) {
        return next(new APIError(
          HttpStatusCode.UNAUTHORIZED,
          ErrorMessages.generateErrorMessage(entity, "unauthorized", lang)
        ));
      }

      const [favorites, total] = await favoriteRepository.findAndCount({
        where: { userId },
        relations: ["car", "car.user", "car.carType", "car.governorateInfo"],
        skip: offset,
        take: limit,
        order: { createdAt: "DESC" }
      });

      const cars = favorites.map(fav => fav.car);

      return res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          {
            items: cars,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
          },
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
    } catch (error) {
      return next(error);
    }
  }
}

export const favoriteController = new FavoriteController();
