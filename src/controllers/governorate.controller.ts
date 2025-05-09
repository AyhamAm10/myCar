import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { Governorate } from "../entities/governorate";
import { APIError } from "../common/errors/api.error";
import { HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { ApiResponse } from "../common/responses/api.response";

const governorateRepository = AppDataSource.getRepository(Governorate);

export const getAllGovernorates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "المحافظات" : "governorates";

    const governorates = await governorateRepository.find({
      relations: ["cars"],
      order: { name: "ASC" }
    });

    if (!governorates.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        governorates,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getGovernorateByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "المحافظة" : "governorate";

    const governorate = await governorateRepository.findOne({
      where: { name },
      relations: ["cars"]
    });

    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        governorate,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const createGovernorate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "المحافظة" : "governorate";

    if (!name) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const existingGovernorate = await governorateRepository.findOneBy({ name });
    if (existingGovernorate) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "المحافظة موجودة بالفعل" 
          : "Governorate already exists"
      );
    }

    const newGovernorate = governorateRepository.create({
      name
    });

    await governorateRepository.save(newGovernorate);

    res.status(HttpStatusCode.CREATED).json(
      ApiResponse.success(
        newGovernorate,
        ErrorMessages.generateErrorMessage(entityName, "created", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateGovernorate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.params;
    const { newName } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "المحافظة" : "governorate";

    if (!newName) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const governorate = await governorateRepository.findOneBy({ name });
    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    // Check if new name already exists
    const existingGovernorate = await governorateRepository.findOneBy({ name: newName });
    if (existingGovernorate && existingGovernorate.name !== name) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "اسم المحافظة الجديد موجود بالفعل" 
          : "New governorate name already exists"
      );
    }

    governorate.name = newName;
    await governorateRepository.save(governorate);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        governorate,
        ErrorMessages.generateErrorMessage(entityName, "updated", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const deleteGovernorate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "المحافظة" : "governorate";

    const governorate = await governorateRepository.findOne({
      where: { name },
      relations: ["cars"]
    });

    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    // Check if governorate has associated cars
    if (governorate.cars && governorate.cars.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        lang === "ar"
          ? "لا يمكن حذف المحافظة لأنها مرتبطة بسيارات"
          : "Cannot delete governorate with associated cars"
      );
    }

    await governorateRepository.remove(governorate);

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