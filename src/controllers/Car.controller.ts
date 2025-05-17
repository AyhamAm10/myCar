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

const carRepository = AppDataSource.getRepository(Car);
const userRepository = AppDataSource.getRepository(User);
const carTypeRepository = AppDataSource.getRepository(CarType);
const governorateRepository = AppDataSource.getRepository(Governorate);
const attributeRepository = AppDataSource.getRepository(Attribute)
const attributeValueRepository = AppDataSource.getRepository(CarAttribute)
const optionRepository = AppDataSource.getRepository(AttributeOption)
const promationRepository = AppDataSource.getRepository(PromotionRequest)

export const getAllCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارات" : "cars";
    const { status, carType, governorate, minPrice, maxPrice, isFeatured } = req.query;

    let query = carRepository.createQueryBuilder("car")
      .leftJoinAndSelect("car.user", "user")
      .leftJoinAndSelect("car.carType", "carType")
      .leftJoinAndSelect("car.governorateInfo", "governorate")
      .leftJoinAndSelect("car.attributes", "attributes");

    if (status) {
      query = query.andWhere("car.status = :status", { status });
    }

    if (carType) {
      query = query.andWhere("car.carTypeId = :carType", { 
        carType: Number(carType) 
      });
    }

    if (governorate) {
      query = query.andWhere("car.governorate = :governorate", { governorate });
    }

    if (minPrice) {
      query = query.andWhere("car.USD_price >= :minPrice", { 
        minPrice: Number(minPrice) 
      });
    }

    if (maxPrice) {
      query = query.andWhere("car.USD_price <= :maxPrice", { 
        maxPrice: Number(maxPrice) 
      });
    }

    if (isFeatured) {
      query = query.andWhere("car.isFeatured = :isFeatured", { 
        isFeatured: isFeatured === 'true' 
      });
    }

    const cars = await query.getMany();

    if (!cars.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        cars,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
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
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارة" : "car";

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: [
        "user", 
        "carType", 
        "governorateInfo", 
        "attributes",
        "favorites",
        "promotionRequests"
      ]
    });

    if (!car) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    car.viewsCount += 1;
    await carRepository.save(car);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        car,
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
      title,
      description,
      usdPrice,
      sypPrice,
      carTypeId,
      governorate,
      address,
      lat,
      long,
      attributes,
      promotion_request
    } = req.body;
    const userId = req.user?.id
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "السيارة" : "car";

    const requiredFields = [
       'title', 'description', 
      'usdPrice', 'carTypeId', 'governorate', 
      'address', 'lat', 'long'
    ];
    
    console.log(req.body)
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
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

    const gov = await governorateRepository.findOneBy({ name: governorate });
    if (!gov) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        lang === "ar" ? "المحافظة غير موجودة" : "Governorate not found"
      );
    }

    const newCar = carRepository.create({
      userId,
      title,
      description,
      images:req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : [],
      usdPrice: Number(usdPrice),
      sypPrice: sypPrice ? Number(sypPrice) : Number(usdPrice) * 15000, // افتراضي إذا لم يتم التزويد
      carTypeId,
      governorate,
      address,
      lat: Number(lat),
      long: Number(long),
      user,
      carType,
      governorateInfo: gov
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
            where:{id: attr.option_id}
        })


        return attributeValueRepository.create({
          attribute: attribute,
            attributeOption: option || null,
            customValue:attr.value,
            car: savedCar
        });
      });

      attributeList = await attributeValueRepository.save(await Promise.all(attributePromises));
    }
    
    if(promotion_request){
      const data =promationRepository.create({
        car:savedCar,
        user,
      })

      await promationRepository.save(data)
    }

    res.status(HttpStatusCode.CREATED).json(
      ApiResponse.success(
        {car:newCar , attribute: attributeList},
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
        title, 
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
        attributes 
      } = req.body;
      
      const lang = req.headers["accept-language"] || "ar";
      const entityName = lang === "ar" ? "السيارة" : "car";
      const user = req.user

      const car = await carRepository.findOne({
        where: { id: Number(id) },
        relations: ["attributes", "carType", "governorateInfo"]
      });

      if(car.user !== user){
        throw new APIError(HttpStatusCode.FORBIDDEN , ErrorMessages.generateErrorMessage("forbidden" , "user"))
      }
  
      if (!car) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entityName, "not found", lang)
        );
      }
  
      if (title) car.title = title;
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
        car.images = (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        );
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
        const gov = await governorateRepository.findOneBy({ name: governorate });
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
            car
          });
        });
  
        car.attributes = await attributeValueRepository.save(
          await Promise.all(attributePromises)
        );
      }
  
      await carRepository.save(car);
  
      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          car,
          ErrorMessages.generateErrorMessage(entityName, "updated", lang)
        )
      );
    } catch (error) {
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
    const user = req.user

    

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: ["favorites", "promotionRequests", "attributes"]
    });

    

    if (!car) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    if(car.user !== user){
      throw new APIError(HttpStatusCode.FORBIDDEN , ErrorMessages.generateErrorMessage("forbidden" , "user"))
    }

    await carRepository.remove(car);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        null,
        ErrorMessages.generateErrorMessage(entity, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};