import { Request, Response } from "express";
import { Between } from "typeorm";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entities/car";
import { PromotionRequest, TypePromotion } from "../entities/promotion-request";
import { Favorite } from "../entities/favorite";

export const getHighlightedCars = async (req: Request, res: Response) => {
  try {
    const carRepo = AppDataSource.getRepository(Car);
    const promoRepo = AppDataSource.getRepository(PromotionRequest);
    const currentUserId = req.user?.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayCars = await carRepo.find({
      where: {
        createdAt: Between(today, tomorrow),
        status: "active",
      },
      take: 10,
      order: {
        createdAt: "DESC",
      },
      relations: ["governorateInfo"],
    });

    const goldenPromoRequests = await promoRepo.find({
      where: {
        requestType: TypePromotion.listing,
        status: "approved",
      },
      relations: ["car"],
      take: 20,
    });

    const goldenCars = goldenPromoRequests
      .map((req) => req.car)
      .filter((car): car is Car => !!car && car.status === "active")
      .slice(0, 10);

      let favoriteCarIds: number[] = [];
      if (currentUserId) {
        const favorites = await AppDataSource.getRepository(Favorite).find({
          where: { userId: currentUserId }
        });
  
        favoriteCarIds = favorites.map(fav => fav.carId);
      }

      const updateGolden = goldenCars.map(car => ({
        ...car,
        isFavorite: currentUserId ? favoriteCarIds.includes(car.id) : false
      }));

      const updatetodayCars = todayCars.map(car => ({
        ...car,
        isFavorite: currentUserId ? favoriteCarIds.includes(car.id) : false
      }));

    res.json({
      golden: updateGolden,
      today: updatetodayCars,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
