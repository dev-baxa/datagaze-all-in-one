import { extname, join } from 'path';

import { BadRequestException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export function fileFieldsConfig(): MulterModuleOptions {
    return {
        storage: diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'icon') {
                    cb(null, join(process.cwd(), 'uploads', 'icons'));
                } else if (file.fieldname === 'server') {
                    cb(null, join(process.cwd(), 'uploads/products', 'server'));
                } else if (file.fieldname === 'agent') {
                    cb(null, join(process.cwd(), 'uploads/products', 'agent'));
                }
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb):void => {
            if (file.fieldname === 'icon') {
                const allowedFileTypes = ['png', 'jpg', 'jpeg', 'gif'];
                if (!allowedFileTypes.includes(file.mimetype.split('/')[1])) {
                    return cb(new BadRequestException('Unsupported file type for icon'), false);
                }
            }
            cb(null, true);
        },
    };
}
