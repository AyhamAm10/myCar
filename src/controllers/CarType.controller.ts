import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { CarType } from "../entities/car-type";
import { APIError } from "../common/errors/api.error";
import { HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { ApiResponse } from "../common/responses/api.response";

const carTypeRepository = AppDataSource.getRepository(CarType);

export const getAllCarTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "أنواع السيارات" : "car types";

    const carTypes = await carTypeRepository.find({
      relations: ["cars"],
      order: { name: "ASC" }
    });

    if (!carTypes.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        carTypes,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getCarTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "نوع السيارة" : "car type";

    const carType = await carTypeRepository.findOne({
      where: { id: Number(id) },
      relations: ["cars"]
    });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        carType,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const createCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "نوع السيارة" : "car type";

    if (!name) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const existingCarType = await carTypeRepository.findOneBy({ name });
    if (existingCarType) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "نوع السيارة موجود بالفعل" 
          : "Car type already exists"
      );
    }

    const newCarType = carTypeRepository.create({
      name
    });

    await carTypeRepository.save(newCarType);

    res.status(HttpStatusCode.CREATED).json(
      ApiResponse.success(
        newCarType,
        ErrorMessages.generateErrorMessage(entityName, "created", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "نوع السيارة" : "car type";
    


    if (!name) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const carType = await carTypeRepository.findOneBy({ id: Number(id) });
    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    const existingCarType = await carTypeRepository.findOneBy({ name });
    if (existingCarType && existingCarType.id !== Number(id)) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "اسم نوع السيارة موجود بالفعل" 
          : "Car type name already exists"
      );
    }

    carType.name = name;
    await carTypeRepository.save(carType);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        carType,
        ErrorMessages.generateErrorMessage(entityName, "updated", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "نوع السيارة" : "car type";

    const carType = await carTypeRepository.findOne({
      where: { id: Number(id) },
      relations: ["cars"]
    });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    // Check if car type has associated cars
    if (carType.cars && carType.cars.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        lang === "ar"
          ? "لا يمكن حذف نوع السيارة لأنه مرتبط بسيارات"
          : "Cannot delete car type with associated cars"
      );
    }

    await carTypeRepository.remove(carType);

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