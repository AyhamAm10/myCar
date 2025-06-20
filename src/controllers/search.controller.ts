import { Request, Response, NextFunction } from "express";
import { APIError, HttpStatusCode } from "../common/errors/api.error";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entities/car";
import { CarAttribute } from "../entities/car-attribute";
import { ApiResponse } from "../common/responses/api.response";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { Favorite } from "../entities/favorite";

export class CarSearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { attributes, modal_year, page = 1, limit = 20 } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "السيارة" : "car";
      const currentUserId = req.user?.id;

      if (page < 1 || limit < 1) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          "Page and limit must be positive numbers"
        );
      }

      const carRepo = AppDataSource.getRepository(Car);
      const query = carRepo
        .createQueryBuilder("car")
        .leftJoinAndSelect("car.user", "user")
        .leftJoinAndSelect("car.attributes", "carAttribute")
        .leftJoinAndSelect("carAttribute.attribute", "attribute")
        .leftJoinAndSelect("carAttribute.attributeOption", "attributeOption")
        .leftJoinAndSelect("car.carType", "carType")
        .leftJoinAndSelect("car.governorateInfo", "governorate");

      if (attributes && attributes.length > 0) {
        attributes.forEach((attr, index) => {
          const alias = `filter_attr_${index}`;

          query.innerJoin(
            "car.attributes",
            alias,
            `${alias}.attribute_id = :attrId${index} AND (${alias}.attribute_option_id = :optionId${index} OR ${alias}.custom_value = :customValue${index})`,
            {
              [`attrId${index}`]: attr.attribute_id,
              [`optionId${index}`]: attr.value,
              [`customValue${index}`]: attr.value,
            }
          );
        });
      }

      if (modal_year) {
        query.andWhere("car.modal_year = :modal_year", { modal_year });
      }

      query.skip((page - 1) * limit).take(limit);

      const [cars, total] = await query.getManyAndCount();

      let favoriteCarIds: number[] = [];
      if (currentUserId) {
        const favorites = await AppDataSource.getRepository(Favorite).find({
          where: { userId: currentUserId },
        });
        favoriteCarIds = favorites.map((fav) => fav.carId);
      }

      const formattedCars = cars.map((car) => {
        const carAttributes =
          car.attributes?.map((attr) => ({
            id: attr.attribute?.id,
            title:
              lang == "ar" ? attr.attribute.title_ar : attr.attribute.title_en,
            value: attr.attributeOption
              ? lang == "ar"
                ? attr.attributeOption.value_ar
                : attr.attributeOption.value_en
              : attr.customValue,
            optionId: attr.attributeOption?.id,
          })) || [];

        return {
          ...car,
          attributes: carAttributes,
          isFavorite: currentUserId ? favoriteCarIds.includes(car.id) : false,
        };
      });

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            formattedCars,
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
            pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
