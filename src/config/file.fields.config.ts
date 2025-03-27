import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export function fileFieldsConfig(): MulterModuleOptions {
    return {
        storage: diskStorage({
            destination: (req, file, cb) => {
                // Fayl nomi bo‘yicha qaysi papkaga saqlashni aniqlaymiz
                const uploadPath =
                    file.fieldname === 'agent'
                        ? join(process.cwd(), 'uploads/products', 'agent')
                        : join(process.cwd(), 'uploads/products', 'server');
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname)); // Unikal fayl nomi
            },
        }),
    };
}
