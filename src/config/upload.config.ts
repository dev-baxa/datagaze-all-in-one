import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs'

const tempDir = path.join('uploads', 'temp');

// Agar papka mavjud bo‘lmasa, yaratamiz
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}


export function multerConfig(): MulterModuleOptions {


    return {
        storage: diskStorage({
            destination: tempDir,
            filename: (req, file, callback) => {
                callback(null, file.originalname);
            },
        }),
    };
}
