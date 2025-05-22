import { Request, Response } from "express";
import { Between } from "typeorm";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entities/car";
import { PromotionRequest } from "../entities/promotion-request";

export const getHighlightedCars = async (req: Request, res: Response) => {
  try {
    const carRepo = AppDataSource.getRepository(Car);
    const promoRepo = AppDataSource.getRepository(PromotionRequest);

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
        requestType: "listing_promotion",
        status: "approved",
      },
      relations: ["car"],
      take: 20,
    });

    // فلترة السيارات المرتبطة التي تكون فعالة ومحققة
    const goldenCars = goldenPromoRequests
      .map((req) => req.car)
      .filter((car): car is Car => !!car && car.status === "active")
      .slice(0, 10);

    res.json({
      golden: goldenCars,
      today: todayCars,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
