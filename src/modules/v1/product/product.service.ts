import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import db from 'src/config/database.config';
import { CreateProductDTO } from './dto/create.product.dto';
import { Product } from './entities/product.interface';
import { CryptoService } from './services/crypto.service';

@Injectable()
export class ProductService extends BaseService<Product> {
    constructor(private readonly crypetoService: CryptoService) {
        super('products');
    }

    async createProduct(file: Express.Multer.File, dto: CreateProductDTO): Promise<string> {
        const product = await db('products')
            .insert({
                ...dto,
                icon_path: file.path,
            })
            .returning('*');

        return product[0].id;
    }

    async uploadFiles(
        productId: string,
        files: { agent?: Express.Multer.File; server?: Express.Multer.File },
    ): Promise<void> {
        if (!files.server || !files.agent) {
            throw new BadRequestException('Server and agent files are required');
        }
        console.log(files);
        

        await db('products').where({ id: productId }).update({
            agent_path: files.agent[0].path,
            server_path: files.server[0].path,
        });
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
