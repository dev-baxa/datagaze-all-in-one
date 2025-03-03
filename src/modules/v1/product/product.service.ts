import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import db from 'src/config/database.config';
import { Product } from './entities/product.interface';

@Injectable()
export class ProductService extends BaseService<Product> {
    constructor() {
        super('products');
    }

    async findByOne(id: string) {
        return await db('products')
            .leftJoin('servers', 'products.server_id', 'servers.id')
            .where('products.id', id)
            .select(
                'products.*',
                db.raw(
                    'CASE WHEN products.server_id IS NULL THEN NULL ELSE servers.ip_address END AS ip',
                ),
            );
    }

    async getAllProducts() {
        return await db('products')
            .leftJoin('servers', 'products.server_id', 'servers.id')
            .select(
                'products.id',
                'products.name',
                'products.os_type',
                'products.description',
                'products.min_requirements',
                'products.path',
                'products.scripts',
                db.raw(
                    'CASE WHEN products.server_id IS NULL THEN NULL ELSE servers.ip_address END AS ip',
                ),
            );

        //     .select(
        //     'id',
        //     'server_id',
        //     'os_type',
        //     'description',
        //     'min_requirements',
        //     'path',
        //     'scripts',
        // );
    }
}
