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
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entity = lang === "ar" ? "المحافظات" : "governorates";

    const governorates = await governorateRepository.find();

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

export const getGovernorateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entity = lang === "ar" ? "المحافظة" : "governorate";

    const governorate = await governorateRepository.findOne({
      where: { id: Number(id) },
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
    const { nameAr, nameEn } = req.body;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "المحافظة" : "governorate";

    if (!nameAr || !nameEn) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const existingGovernorateAr = await governorateRepository.findOneBy({ nameAr });
    if (existingGovernorateAr) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "اسم المحافظة العربي موجود بالفعل" 
          : "Governorate Arabic name already exists"
      );
    }

    const existingGovernorateEn = await governorateRepository.findOneBy({ nameEn });
    if (existingGovernorateEn) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "اسم المحافظة الإنجليزي موجود بالفعل" 
          : "Governorate English name already exists"
      );
    }

    const newGovernorate = governorateRepository.create({
      nameAr,
      nameEn
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
    const { id } = req.params;
    const { nameAr, nameEn } = req.body;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "المحافظة" : "governorate";

    if (!nameAr || !nameEn) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const governorate = await governorateRepository.findOneBy({ id: Number(id) });
    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    // تحقق من عدم وجود اسم عربي جديد مستخدم من محافظة أخرى
    const existingGovernorateAr = await governorateRepository.findOneBy({ nameAr });
    if (existingGovernorateAr && existingGovernorateAr.id !== governorate.id) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar"
          ? "اسم المحافظة العربي الجديد موجود بالفعل"
          : "New Arabic governorate name already exists"
      );
    }

    // تحقق من عدم وجود اسم انجليزي جديد مستخدم من محافظة أخرى
    const existingGovernorateEn = await governorateRepository.findOneBy({ nameEn });
    if (existingGovernorateEn && existingGovernorateEn.id !== governorate.id) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar"
          ? "اسم المحافظة الإنجليزي الجديد موجود بالفعل"
          : "New English governorate name already exists"
      );
    }

    governorate.nameAr = nameAr;
    governorate.nameEn = nameEn;

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
    const { id } = req.params;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entity = lang === "ar" ? "المحافظة" : "governorate";

    const governorate = await governorateRepository.findOne({
      where: { id: Number(id) },
      relations: ["cars"]
    });

    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    // التحقق من وجود سيارات مرتبطة
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
