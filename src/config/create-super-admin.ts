import { AppDataSource } from "../config/data_source";
import * as bcrypt from "bcryptjs";
import { logger } from "../logging/logger";
import { User, UserRole } from "../entities/user";

export async function createSuperAdmin() {
    const userRepository = AppDataSource.getRepository(User);
    
    const existingSuperAdmin = await userRepository.findOne({
        where: { role: UserRole.superAdmin }
    });

    if (existingSuperAdmin) {
        logger.info('Super admin already exists, skipping creation');
        return;
    }

    const superAdminData = {
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        phone: process.env.SUPER_ADMIN_PHONE || '963999999999',
        passwordHash: await bcrypt.hash(
            process.env.SUPER_ADMIN_PASSWORD || 'admin123', 
            10
        ),
        role: UserRole.superAdmin as const,
        verified: true
    };

    const superAdmin = userRepository.create(superAdminData);
    await userRepository.save(superAdmin);

    logger.info('Super admin created successfully');
}