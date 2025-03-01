import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    private readonly baseDir = path.join('uploads', 'products');

    constructor() {
        this.ensureDirectoryExists(this.baseDir);
    }

    private ensureDirectoryExists(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    generateUploadPath(product_name: string, os_type: string, version: string) {
        const productDir = path.join(this.baseDir, product_name);
        this.ensureDirectoryExists(productDir);

        const osDir = path.join(productDir, os_type);
        this.ensureDirectoryExists(osDir);

        const versionDir = path.join(osDir, version);
        this.ensureDirectoryExists(versionDir);

        return versionDir;
    }

    saveFile(file: Express.Multer.File, uploadPath: string): string {
        const filePath = path.join(uploadPath, file.originalname);
        fs.renameSync(file.path, filePath);
        return filePath;
    }
}
