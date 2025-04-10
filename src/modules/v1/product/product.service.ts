import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import db from 'src/config/database.config';

import { CreateProductDTO } from './dto/create.product.dto';
import { IProduct } from './entities/product.interface';

@Injectable()
export class ProductService extends BaseService<IProduct> {
    constructor() {
        super('products');
    }

    async createProduct(
        files: {
            icon: Express.Multer.File;
            server: Express.Multer.File;
            agent: Express.Multer.File;
        },
        dto: CreateProductDTO,
    ): Promise<string> {
        const product = await db('products')
            .insert({
                ...dto,
                icon_path: files.icon[0].path,
                server_path: files.server[0].path,
                agent_path: files.agent[0].path,
            })
            .returning('*');

        return product[0].id;
    }

    async findByOne(id: string): Promise<(IProduct & { ip: string | null })[]> {
        return db('products')
            .leftJoin('servers', 'products.server_id', 'servers.id')
            .where('products.id', id)
            .select(
                'products.*',
                db.raw(
                    'CASE WHEN products.server_id IS NULL THEN NULL ELSE servers.ip_address END AS ip',
                ),
            );
    }

    async getAllProducts(): Promise<(Partial<IProduct> & { ip: string | null })[]> {
        return db('products')
            .leftJoin('servers', 'products.server_id', 'servers.id')
            .select(
                'products.id',
                'products.name',
                'products.description',
                'products.min_requirements',
                'products.agent_path',
                'products.server_path',
                'products.icon_path',
                'products.install_scripts',
                db.raw(
                    'CASE WHEN products.server_id IS NULL THEN NULL ELSE servers.ip_address END AS ip',
                ),
            );
    }
}
