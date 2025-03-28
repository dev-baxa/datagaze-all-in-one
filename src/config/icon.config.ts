import { BadRequestException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export function iconConfig(): MulterModuleOptions {
    return {
        storage: diskStorage({
            destination: join(process.cwd(), 'uploads', 'icons'),
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname); // Fayl kengaytmasini olish
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            const allowedFileTypes = ['png', 'jpg', 'jpeg', 'gif'];
            if (!allowedFileTypes.includes(file.mimetype.split('/')[1])) {
                return callback(new BadRequestException('Unsupported file type'), false);
            }
            callback(null, true);
      },
        limits:{}
    };
}
