import { Request, Response, NextFunction } from "express";
import { Attribute, AttributeFor } from "../entities/Attributes";
import { AppDataSource } from "../config/data_source";
import { APIError } from "../common/errors/api.error";
import { HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import { ApiResponse } from "../common/responses/api.response";
import { CarType } from "../entities/car-type";
import { AttributeOption } from "../entities/attribute-option";
import { In } from "typeorm";

const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeOptionRepository = AppDataSource.getRepository(AttributeOption);

export const getAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purpose, showInSearch, carTypeId } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخصائص" : "attributes";

    let queryBuilder = attributeRepository
      .createQueryBuilder("attribute")
      .leftJoinAndSelect("attribute.options", "options")
      .leftJoinAndSelect("attribute.children", "children")
      .leftJoinAndSelect("attribute.carType", "carType");

    queryBuilder = queryBuilder.andWhere("attribute.parent IS NULL");

    if (purpose) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.purpose = :purpose OR attribute.purpose = 'both'",
        { purpose }
      );
    }

    if (showInSearch !== undefined) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.showInSearch = :showInSearch",
        { showInSearch: showInSearch === "true" }
      );
    }

    if (carTypeId) {
      queryBuilder = queryBuilder.andWhere("carType.id = :carTypeId", {
        carTypeId: Number(carTypeId),
      });
    }

    const attributes = await queryBuilder.getMany();

    if (!attributes.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          attributes,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getAttributesForEditCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purpose, showInSearch, carTypeId } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخصائص" : "attributes";

    let queryBuilder = attributeRepository
      .createQueryBuilder("attribute")
      .leftJoinAndSelect("attribute.options", "options")
      .leftJoinAndSelect("attribute.children", "children")
      .leftJoinAndSelect("attribute.carType", "carType");

    if (purpose) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.purpose = :purpose OR attribute.purpose = 'both'",
        { purpose }
      );
    }

    if (showInSearch !== undefined) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.showInSearch = :showInSearch",
        { showInSearch: showInSearch === "true" }
      );
    }

    if (carTypeId) {
      queryBuilder = queryBuilder.andWhere("carType.id = :carTypeId", {
        carTypeId: Number(carTypeId),
      });
    }

    const attributes = await queryBuilder.getMany();

    if (!attributes.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const dtaFactory = attributes.map((item) => {
      const { title_ar, title_en, ...dataWonted } = item;
      return {
        title: lang == "ar" ? title_ar : title_en,
        ...dataWonted,
      };
    });

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          dtaFactory,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getAttributeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOne({
      where: { id: Number(id) },
      relations: ["options", "children", "parent", "carType"],
    });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const { title_ar, title_en, ...dataWonted } = attribute;
    const factorData = {
      title: lang == "ar" ? title_ar : title_en,
      ...dataWonted,
    };

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          factorData,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getChildAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { parentId } = req.params;
    const { optionParentId } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخصائص الفرعية" : "child attributes";

    const parentIdNum = Number(parentId);
    console.log(parentId);
    if (isNaN(parentIdNum)) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        lang === "ar" ? "معرف الخاصية غير صالح" : "Invalid attribute ID"
      );
    }

    const whereClause: any = {
      parent: { id: parentIdNum },
    };

    if (optionParentId) {
      const optionParentIdNum = Number(optionParentId);
      if (isNaN(optionParentIdNum)) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "معرف الخيار غير صالح" : "Invalid option ID"
        );
      }
      whereClause.parentOption = { id: optionParentIdNum };
    }

    const children = await attributeRepository.find({
      where: whereClause,
      relations: ["options"],
    });

    if (!children.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    // const dtaFactory = children.map((item) => {
    //   const { title_ar, title_en, ...dataWonted } = item;
    //   return {
    //     title: lang == "ar" ? title_ar : title_en,
    //     ...dataWonted,
    //   };
    // });

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          children,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title_ar,
      title_en,
      input_type,
      parentId,
      options,
      show_in_search = false,
      purpose,
      parent_option_id,
      car_type_id,
      hasChild,
    } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "الخاصية" : "attribute";

    if (!title_ar || !title_en || !input_type) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    let parent: Attribute | null = null;
    if (parentId) {
      parent = await attributeRepository.findOneBy({ id: parentId });
      if (!parent) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar"
            ? "الخاصية الأم غير موجودة"
            : "Parent attribute not found"
        );
      }
    }

    let parentOption: AttributeOption | null = null;
    if (parent_option_id) {
      parentOption = await attributeOptionRepository.findOneBy({
        id: parent_option_id,
      });
      if (!parentOption) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar"
            ? "خيار الخاصية الأم غير موجود"
            : "Parent option not found"
        );
      }
    }

    let carType = null;
    if (car_type_id) {
      carType = await AppDataSource.getRepository(CarType).findOneBy({
        id: car_type_id,
      });
      if (!carType) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "نوع السيارة غير موجود" : "Car type not found"
        );
      }
    }

    const newAttribute = attributeRepository.create({
      title_ar,
      title_en,
      input_type,
      showInSearch:
        typeof show_in_search === "string"
          ? show_in_search === "true"
          : Boolean(show_in_search),
      purpose: purpose || AttributeFor.sale,
      icon: req.file ? `/public/icon/${req.file.filename}` : null,
      parent,
      parentOption,
      carType,
      hasChild,
    });

    await attributeRepository.save(newAttribute);

    if (options && Array.isArray(options)) {
      const values = options.map((o) => o.value_en.toLowerCase().trim());
      if (new Set(values).size !== options.length) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "يوجد خيارات مكررة" : "Duplicate options found"
        );
      }

      const attributeOptions = options.map((option) => ({
        value_en: option.value_en.trim(),
        value_ar: option.value_ar.trim(),
        attribute: newAttribute,
      }));

      await attributeOptionRepository.save(attributeOptions);
    }

    res
      .status(HttpStatusCode.CREATED)
      .json(
        ApiResponse.success(
          newAttribute,
          ErrorMessages.generateErrorMessage(entityName, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      title_ar,
      title_en,
      input_type,
      parentId,
      options,
      car_type_id,
      hasChild,
    } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOne({
      where: { id: Number(id) },
      relations: ["options", "parent"],
    });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    if (parentId !== undefined) {
      const parent = parentId
        ? await attributeRepository.findOneBy({ id: parentId })
        : null;

      if (parentId && !parent) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar"
            ? "الخاصية الأم غير موجودة"
            : "Parent attribute not found"
        );
      }
      attribute.parent = parent;
    }

    if (car_type_id !== undefined) {
      const carType = car_type_id
        ? await AppDataSource.getRepository(CarType).findOneBy({
            id: car_type_id,
          })
        : null;

      if (car_type_id && !carType) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "نوع السيارة غير موجود" : "Car type not found"
        );
      }
      attribute.carType = carType;
    }

    attribute.title_ar = title_ar || attribute.title_ar;
    attribute.title_en = title_en || attribute.title_en;
    attribute.input_type = input_type || attribute.input_type;
    if (req.file) attribute.icon = `/public/icon/${req.file.filename}`;
    if (hasChild !== undefined) attribute.hasChild = hasChild;

    if (options) {
      await attributeOptionRepository.delete({
        attribute: { id: attribute.id },
      });
      const attributeOptions = options.map((option) => ({
        value: option.value,
        attribute,
      }));
      await attributeOptionRepository.save(attributeOptions);
    }

    await attributeRepository.save(attribute);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          attribute,
          ErrorMessages.generateErrorMessage(entityName, "updated", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const deleteAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOne({
      where: { id: Number(id) },
      relations: ["options", "children"],
    });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    // حذف الـ Options المرتبطة
    if (attribute.options?.length) {
      await attributeOptionRepository.remove(attribute.options);
    }

    // فصل الأبناء قبل الحذف
    if (attribute.children?.length) {
      await attributeRepository.update(
        { parent: { id: attribute.id } },
        { parent: null }
      );
    }

    await attributeRepository.remove(attribute);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          null,
          ErrorMessages.generateErrorMessage(entity, "deleted", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const changeAttributeEffict = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارة" : "car";
    const { id } = req.params;
    const { value } = req.body;
  } catch (error) {
    next(error);
  }
};
