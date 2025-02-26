import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('installed_products', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
        table.uuid('server_id').references('id').inTable('servers').onDelete('CASCADE');
        table.string('version').defaultTo('1.0.0');
        table.string('status').defaultTo('installed');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('installed_products');
}
