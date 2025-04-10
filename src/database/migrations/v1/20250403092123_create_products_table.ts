import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('products', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table
            .uuid('server_id')
            .nullable()
            .references('id')
            .inTable('servers')
            .onDelete('SET NULL')
            .defaultTo(null);
        table.string('name');
        table.text('description').notNullable();
        table.text('min_requirements').notNullable();

        // From update_product_icon_path
        table.string('icon_path');

        // From update_products_isInstalled
        table.boolean('is_installed').defaultTo(false);

        // From 20250321134047_update_products
        table.string('agent_version').nullable().defaultTo(null);
        table.string('publisher').nullable().defaultTo(null);
        table.text('install_scripts').nullable().defaultTo(null);
        table.text('update_scripts').nullable().defaultTo(null);
        table.text('delete_scripts').nullable().defaultTo(null);
        table.string('server_path').nullable().defaultTo(null);
        table.string('agent_path').nullable().defaultTo(null);
        table.string('server_version').nullable().defaultTo(null);

        // From update_product_path
        table.specificType('path', 'json').nullable().defaultTo(null);

        table.timestamps(false, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('products');
}
