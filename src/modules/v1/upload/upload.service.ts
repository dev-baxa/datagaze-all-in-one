import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import db from 'src/config/database.config';
import { Product } from '../product/entities/product.interface';

@Injectable()
export class UploadService {
    private readonly baseDir = path.join('uploads', 'products');

    constructor() {
        this.ensureDirectoryExists(this.baseDir);
    }

    public product: Product;

    private ensureDirectoryExists(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async checkProducdtExists(product_name: string): Promise<void> {
        const product = await db('products').where({ name: product_name }).first();
        if (!product) throw new NotFoundException('product not found');
        this.product = product;
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

    async saveFile(file: Express.Multer.File, uploadPath: string , os_type:string , version:string): Promise<string> {
        const filePath = path.join( process.cwd(), uploadPath, file.originalname);
        fs.renameSync(file.path, filePath);
        let path2 = this.product.path || {}

        path2[`${os_type}.v-${version}`] = filePath
        
        await db('products')
            .where({ id: this.product.id })
           .update({ path: path2 })
        
        return filePath;
    }
}
