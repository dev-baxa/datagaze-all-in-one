import db from 'src/config/database.config';

import { IProduct } from '../../product/entities/product.interface';
import { IServer } from '../entity/server.interface';

export async function saveInstallationData(
    product: IProduct,
    serverData: Partial<IServer>,
): Promise<IServer> {
    const [server] = await db('servers').insert(serverData).returning('*');

    await db('installed_products').insert({
        product_id: product.id,
        server_id: server.id,
        version: product.server_version,
        status: 'installed',
    });

    await db('products')
        .update({ server_id: server.id, is_installed: true })
        .where({ id: product.id });

    return server;
}
