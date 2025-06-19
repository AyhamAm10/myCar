import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entities/car";
import { APIError } from "../common/errors/api.error";
import { HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { ApiResponse } from "../common/responses/api.response";
import { User } from "../entities/user";
import { CarType } from "../entities/car-type";
import { Governorate } from "../entities/governorate";
import { Attribute } from "../entities/Attributes";
import { CarAttribute } from "../entities/car-attribute";
import { AttributeOption } from "../entities/attribute-option";
import { PromotionRequest } from "../entities/promotion-request";
import { Favorite } from "../entities/favorite";
import { Not } from "typeorm";

const carRepository = AppDataSource.getRepository(Car);
const userRepository = AppDataSource.getRepository(User);
const carTypeRepository = AppDataSource.getRepository(CarType);
const governorateRepository = AppDataSource.getRepository(Governorate);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(CarAttribute);
const optionRepository = AppDataSource.getRepository(AttributeOption);
const promationRepository = AppDataSource.getRepository(PromotionRequest);
const favoriteRepository = AppDataSource.getRepository(Favorite);

export const getAllCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارات" : "cars";
    const {
      status,
      carType,
      governorate,
      minPrice,
      maxPrice,
      isFeatured,
      userId,
      search,
      sort = "desc",
      page = "1",
      limit = "10",
      lat,
      long,
      radius = "10",
    } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const currentUserId = req.user?.id;

    let query = carRepository
      .createQueryBuilder("car")
      .leftJoinAndSelect("car.user", "user")
      .leftJoinAndSelect("car.carType", "carType")
      .leftJoinAndSelect("car.governorateInfo", "governorateInfo")
      .leftJoinAndSelect("car.attributes", "carAttributes")
      .leftJoinAndSelect("car.promotionRequests", "promotion")
      .leftJoinAndSelect("carAttributes.attribute", "attribute")
      .leftJoinAndSelect("carAttributes.attributeOption", "attributeOption");

    if (search) {
      query = query.andWhere(
        "(car.title_ar LIKE :search OR car.title_en LIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (sort === "asc") {
      query = query.orderBy("car.createdAt", "ASC");
    } else {
      query = query.orderBy("car.createdAt", "DESC");
    }

    if (status) {
      query = query.andWhere("car.status = :status", { status });
    }

    if (carType) {
      query = query.andWhere("car.carTypeId = :carType", {
        carType: Number(carType),
      });
    }

    if (governorate) {
      query = query.andWhere("car.governorateInfo = :governorate", {
        governorate,
      });
    }

    if (minPrice) {
      query = query.andWhere("car.USD_price >= :minPrice", {
        minPrice: Number(minPrice),
      });
    }

    if (maxPrice) {
      query = query.andWhere("car.USD_price <= :maxPrice", {
        maxPrice: Number(maxPrice),
      });
    }

    if (isFeatured) {
      query = query.andWhere("car.isFeatured = :isFeatured", {
        isFeatured: isFeatured === "true",
      });
    }

    if (userId) {
      query = query.andWhere("car.userId = :userId", {
        userId: Number(userId),
      });
    }

    if (lat && long) {
      const userLat = parseFloat(lat as string);
      const userLong = parseFloat(long as string);
      const searchRadius = parseFloat(radius as string);

      const earthRadiusKm = 6371;

      query = query.andWhere(
        `(${earthRadiusKm} * acos(
        cos(radians(:userLat)) * cos(radians(car.lat)) *
        cos(radians(car.long) - radians(:userLong)) +
        sin(radians(:userLat)) * sin(radians(car.lat))
      )
    ) <= :maxDistance`,
        {
          userLat,
          userLong,
          maxDistance: searchRadius,
        }
      );
    }

    query = query.skip(skip).take(pageSize);

    const [cars, totalCount] = await query.getManyAndCount();

    const formattedCarsData = cars.map((car) => {
      let attributes = [];
      if (car.attributes && car.attributes.length > 0) {
        attributes = car.attributes.map((att) => ({
          id: att.attribute?.id,
          title: lang == "ar" ? att.attribute.title_ar : att.attribute.title_en,
          value: att.attributeOption
            ? lang == "ar"
              ? att.attributeOption.value_ar
              : att.attributeOption.value_en
            : att.customValue,
          optionId: att.attributeOption?.id,
        }));
      }

      const hasPromotionRequest =
    car.promotionRequests?.some((req) => req.status === "pending" || req.status === "approved") ?? false;
      return {
        ...car,
        attributes,
        hasPromotionRequest
      };
    });

    if (!formattedCarsData.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    let favoriteCarIds: number[] = [];

    if (currentUserId) {
      const favorites = await favoriteRepository.find({
        where: { userId: currentUserId },
      });
      favoriteCarIds = favorites.map((fav) => fav.carId);
    }

    const updatedCars = formattedCarsData.map((car) => ({
      ...car,
      isFavorite: currentUserId ? favoriteCarIds.includes(car.id) : false,
    }));

    const pagination = {
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          updatedCars,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getCarById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارة" : "car";

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: [
        "user",
        "carType",
        "governorateInfo",
        "attributes",
        "attributes.attribute",
        "attributes.attributeOption",
        "promotionRequests",
      ],
    });

    if (!car) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    car.viewsCount += 1;
    await carRepository.save(car);

    const formattedAttributes = await Promise.all(
      car.attributes?.map(async (attr) => {
        const attribute = await attributeRepository.find({
          where: { id: attr.attribute.id },
          relations: ["options", "parent"],
        });
        return {
          id: attr.id,
          attributeId: attr.attribute?.id,
          title:
            lang == "ar" ? attr.attribute.title_ar : attr.attribute.title_en,
          value: attr.attributeOption
            ? lang == "ar"
              ? attr.attributeOption.value_ar
              : attr.attributeOption.value_en
            : attr.customValue,
          optionId: attr.attributeOption?.id,
          attribute_data: attribute,
        };
      }) || []
    );

    let favoriteCarIds: number[] = [];

    if (userId) {
      const favorites = await favoriteRepository.find({
        where: { userId: userId },
      });
      favoriteCarIds = favorites.map((fav) => fav.carId);
    }

    // Get recommended cars (limit 3)
    const recommendedCars = await carRepository.find({
      where: {
        carTypeId: car.carTypeId,
        governorateId: car.governorateId,
        status: "active",
        id: Not(car.id),
      },
      take: 3,
      order: { createdAt: "DESC" },
      relations: [
        "carType",
        "governorateInfo",
        "attributes",
        "attributes.attributeOption",
      ],
    });

    const result = {
      ...car,
      attributes: formattedAttributes,
      isFavorite: userId ? favoriteCarIds.includes(car.id) : false,
      recommended: recommendedCars,
    };

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          result,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title_ar,
      title_en,
      description,
      usdPrice,
      sypPrice,
      carTypeId,
      governorate,
      address,
      lat,
      long,
      attributes,
      promotion_request,
    } = req.body;
    console.log(req.body)
    const userId = req.user?.id;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "السيارة" : "car";

    const requiredFields = [
      "title",
      "description",
      "usdPrice",
      "carTypeId",
      "governorate",
      "address",
      "lat",
      "long",
    ];

    console.log(req.body);
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        lang === "ar" ? "المستخدم غير موجود" : "User not found"
      );
    }

    const carType = await carTypeRepository.findOneBy({ id: carTypeId });
    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        lang === "ar" ? "نوع السيارة غير موجود" : "Car type not found"
      );
    }

    const gov = await governorateRepository.findOneBy({ id: governorate });
    if (!gov) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        lang === "ar" ? "المحافظة غير موجودة" : "Governorate not found"
      );
    }

    const newCar = carRepository.create({
      userId,
      title_ar,
      title_en,
      description,
      images: req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => `/public/uploads/${file.filename}`
          )
        : [],
      usdPrice: Number(usdPrice),
      sypPrice: sypPrice ? Number(sypPrice) : Number(usdPrice) * 15000, // افتراضي إذا لم يتم التزويد
      carTypeId,
      governorateId: governorate,
      address,
      lat: Number(lat),
      long: Number(long),
      user,
      carType,
      governorateInfo: gov,
    });

    const savedCar = await carRepository.save(newCar);

    let attributeList = [];
    if (attributes && attributes.length > 0) {
      const attributePromises = attributes.map(async (attr) => {
        const attribute = await attributeRepository.findOneBy({ id: attr.id });
        if (!attribute) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("Attribute", "not found", lang)
          );
        }

        const option = await optionRepository.findOne({
          where: { id: attr.option_id },
        });

        return attributeValueRepository.create({
          attribute: attribute,
          attributeOption: option || null,
          customValue: attr.value,
          car: savedCar,
        });
      });

      attributeList = await attributeValueRepository.save(
        await Promise.all(attributePromises)
      );
    }

    if (promotion_request) {
      const data = promationRepository.create({
        car: savedCar,
        user,
      });

      await promationRepository.save(data);
    }

    res
      .status(HttpStatusCode.CREATED)
      .json(
        ApiResponse.success(
          { car: newCar, attribute: attributeList },
          ErrorMessages.generateErrorMessage(entityName, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      title_ar,
      title_en,
      description,
      usdPrice,
      sypPrice,
      carTypeId,
      governorate,
      address,
      lat,
      long,
      isFeatured,
      isVerified,
      status,
      attributes,
      keepImages,
    } = req.body;

    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "السيارة" : "car";
    const user = req.user;

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: ["attributes", "carType", "governorateInfo", "user"],
    });

    if (car.user?.id !== user.id) {
      throw new APIError(
        HttpStatusCode.FORBIDDEN,
        ErrorMessages.generateErrorMessage("user", "forbidden")
      );
    }

    if (!car) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    if (title_ar) car.title_ar = title_ar;
    if (title_en) car.title_en = title_en;
    if (description) car.description = description;
    if (usdPrice) car.usdPrice = Number(usdPrice);
    if (sypPrice) car.sypPrice = Number(sypPrice);
    if (address) car.address = address;
    if (lat) car.lat = Number(lat);
    if (long) car.long = Number(long);
    if (isFeatured !== undefined) car.isFeatured = isFeatured;
    if (isVerified !== undefined) car.isVerified = isVerified;
    if (status) car.status = status;

    if (req.files) {
      const files = (req.files as Express.Multer.File[]) || [];
      console.log(files);
      const newImages = files.map((file) => `/public/uploads/${file.filename}`);
      car.images = [...(keepImages || []), ...newImages];
    }

    if (carTypeId) {
      const carType = await carTypeRepository.findOneBy({ id: carTypeId });
      if (!carType) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          lang === "ar" ? "نوع السيارة غير موجود" : "Car type not found"
        );
      }
      car.carType = carType;
    }

    if (governorate) {
      const gov = await governorateRepository.findOneBy({ id: governorate });
      if (!gov) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          lang === "ar" ? "المحافظة غير موجودة" : "Governorate not found"
        );
      }
      car.governorateInfo = gov;
    }

    if (attributes && Array.isArray(attributes)) {
      await attributeValueRepository.delete({ car: { id: car.id } });

      const attributePromises = attributes.map(async (attr) => {
        const attribute = await attributeRepository.findOneBy({ id: attr.id });
        if (!attribute) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            lang === "ar" ? "السمة غير موجودة" : "Attribute not found"
          );
        }

        const option = attr.option_id
          ? await optionRepository.findOneBy({ id: attr.option_id })
          : null;

        return attributeValueRepository.create({
          attribute,
          attributeOption: option,
          customValue: attr.value,
          car,
        });
      });

      car.attributes = await attributeValueRepository.save(
        await Promise.all(attributePromises)
      );
    }

    await carRepository.save(car);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          car,
          ErrorMessages.generateErrorMessage(entityName, "updated", lang)
        )
      );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارة" : "car";
    const user = req.user;

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: ["favorites", "promotionRequests", "attributes", "user"],
    });

    if (!car) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    if (car.user.id !== user?.id) {
      throw new APIError(
        HttpStatusCode.FORBIDDEN,
        ErrorMessages.generateErrorMessage(entity, "forbidden")
      );
    }

    await carRepository.remove(car);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          null,
          ErrorMessages.generateErrorMessage(entity, "deleted", lang)
        )
      );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
