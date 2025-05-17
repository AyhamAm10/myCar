import { Request, Response, NextFunction } from 'express';
import { APIError, HttpStatusCode } from '../common/errors/api.error';
import { AppDataSource } from '../config/data_source';
import { Car } from '../entities/car';
import { CarAttribute } from '../entities/car-attribute';
import { ApiResponse } from '../common/responses/api.response';
import { ErrorMessages } from '../common/errors/ErrorMessages';

export class CarSearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { attributes, page = 1, limit = 20 } = req.body;
      const lang = req.headers['accept-language'] || 'ar';
      const entity = lang === 'ar' ? 'السيارة' : 'car';

      if (page < 1 || limit < 1) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          'Page and limit must be positive numbers'
        );
      }

      const carRepo = AppDataSource.getRepository(Car);
      const query = carRepo.createQueryBuilder('car')
        .leftJoinAndSelect('car.attributes', 'car_attribute')
        .leftJoinAndSelect('car_attribute.attribute', 'attribute')
        .leftJoinAndSelect('car_attribute.attributeOption', 'attributeOption')
        .leftJoinAndSelect('car.carType', 'carType')
        .leftJoinAndSelect('car.governorateInfo', 'governorate');

      if (attributes && attributes.length > 0) {
        for (let index = 0; index < attributes.length; index++) {
          const attr = attributes[index];
          const alias = `filter_attr_${index}`;

          query.innerJoin(
            CarAttribute,
            alias,
            `${alias}.car = car.id AND ${alias}.attribute = :attrId${index} AND ${alias}.attributeOption = :optionId${index}`,
            {
              [`attrId${index}`]: attr.attribute_id,
              [`optionId${index}`]: attr.value,
            }
          );
        }
      }

      query.skip((page - 1) * limit).take(limit);

      const [cars, total] = await query.getManyAndCount();

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          cars,
          ErrorMessages.generateErrorMessage(entity, 'retrieved', lang),
          pagination
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
