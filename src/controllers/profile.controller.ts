import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data_source';
import { User } from '../entities/user'; 
import { ApiResponse } from '../common/responses/api.response'; 
import { APIError, HttpStatusCode } from '../common/errors/api.error';
import { ErrorMessages } from '../common/errors/ErrorMessages';

export class ProfileController {
  private userRepository = AppDataSource.getRepository(User);

  async updateProfile(req: Request, res: Response, next: NextFunction) {

    try {
      const userId = req.user.id;
      const updateData = req.body;
      const { phone, name , ...secureData } = updateData;
      const image = req.file ? req.file.filename : null;

      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("user", "not found")
        );
      }

      if (phone && phone !== user.phone) {
        const existingUser = await this.userRepository.findOneBy({ phone });
        if (existingUser) {
          throw new APIError(
            HttpStatusCode.BAD_REQUEST,
            ErrorMessages.generateErrorMessage("phone",'already exists' )
          );
        }
      }

      user.phone = phone || user.phone;
      user.name = name || user.name;
      
      if(image){
        if (user.image) {
          await this.deleteOldImage(user.image);
        }
        user.image = image 
      }

      const updatedUser = await this.userRepository.save(user)
      const {passwordHash , ...userData  } = updatedUser      

      return res.status(200).json(
        ApiResponse.success({ user: userData }, 'Profile updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  private async deleteOldImage(filename: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const imagePath = path.join(__dirname, '../public/uploads', filename);
    
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Failed to delete old image:', error);
    }
  }
}