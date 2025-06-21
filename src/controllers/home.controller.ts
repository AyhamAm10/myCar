import { NextFunction, Request, Response } from "express";
import { Between } from "typeorm";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entities/car";
import { PromotionRequest, TypePromotion } from "../entities/promotion-request";
import { Favorite } from "../entities/favorite";
import { AttributeSearchHistory } from "../entities/attribute-search-history";

export const getHighlightedCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const carRepo = AppDataSource.getRepository(Car);
    const promoRepo = AppDataSource.getRepository(PromotionRequest);
    const historyRepo = AppDataSource.getRepository(AttributeSearchHistory);
    const favoriteRepo = AppDataSource.getRepository(Favorite);

    const currentUserId = req.user?.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // سيارات اليوم
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

    // استرجاع سيارات الذهب من الـ Promo
    const goldenPromoRequests = await promoRepo.find({
      where: {
        requestType: TypePromotion.listing,
        status: "approved",
      },
      relations: [
        "car",
        "car.attributes",
        "car.attributes.attribute",
        "car.attributes.attributeOption",
      ],
      take: 20,
    });

    let goldenCars = goldenPromoRequests
      .map((req) => req.car)
      .filter((car): car is Car => !!car && car.status === "active");

    let highlightedCars: Car[] = [];

    // سجل البحث
    let validHistory: { attributeId: number; optionId: number }[] = [];

    if (currentUserId) {
      const searchHistory = await historyRepo.find({
        where: { user: { id: currentUserId } },
        relations: ["attribute", "attributeOption"],
        order: { count: "DESC" },
        take: 5,
      });

      validHistory = searchHistory
        .filter((h) => !!h.attributeOption?.id)
        .map((h) => ({
          attributeId: h.attribute.id,
          optionId: h.attributeOption.id,
        }));
    }

    if (goldenCars.length > 0) {
      // ترتيب سيارات gold حسب سجل البحث
      if (validHistory.length > 0) {
        goldenCars.sort((a, b) => {
          const aMatches =
            a.attributes?.filter((attr) =>
              validHistory.some(
                (h) =>
                  h.attributeId === attr.attribute?.id &&
                  h.optionId === attr.attributeOption?.id
              )
            ).length || 0;

          const bMatches =
            b.attributes?.filter((attr) =>
              validHistory.some(
                (h) =>
                  h.attributeId === attr.attribute?.id &&
                  h.optionId === attr.attributeOption?.id
              )
            ).length || 0;

          return bMatches - aMatches;
        });
      }

      highlightedCars = goldenCars.slice(0, 10);
    } else if (validHistory.length > 0) {
      // جلب سيارات بناءً على البحث فقط
      const query = carRepo
        .createQueryBuilder("car")
        .innerJoin("car.attributes", "carAttribute")
        .leftJoinAndSelect("car.governorateInfo", "governorate")
        .where("car.status = :status", { status: "active" });

      const conditions: string[] = [];
      const parameters: Record<string, any> = { status: "active" };

      validHistory.forEach((h, index) => {
        conditions.push(
          `(carAttribute.attribute_id = :attrId${index} AND carAttribute.attribute_option_id = :optId${index})`
        );
        parameters[`attrId${index}`] = h.attributeId;
        parameters[`optId${index}`] = h.optionId;
      });

      query.andWhere(conditions.join(" OR "), parameters).take(10);

      highlightedCars = await query.getMany();
    }

    if (highlightedCars.length === 0) {
      highlightedCars = await carRepo.find({
        where: { status: "active" },
        take: 10,
        order: { createdAt: "DESC" },
        relations: ["governorateInfo"],
      });
    }

    // المفضلة
    let favoriteCarIds: number[] = [];
    if (currentUserId) {
      const favorites = await favoriteRepo.find({
        where: { userId: currentUserId },
      });
      favoriteCarIds = favorites.map((fav) => fav.carId);
    }

    const updateHighlighted = highlightedCars.map((car) => ({
      ...car,
      isFavorite: currentUserId ? favoriteCarIds.includes(car.id) : false,
    }));

    const updateTodayCars = todayCars.map((car) => ({
      ...car,
      isFavorite: currentUserId ? favoriteCarIds.includes(car.id) : false,
    }));

    res.json({
      golden: updateHighlighted,
      today: updateTodayCars,
    });
  } catch (err) {
    next(err);
  }
};
