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
        table.string('os_type').defaultTo('linux');
        table.text('description').notNullable();
        table.text('min_requirements').notNullable();
        table.string('path').notNullable();
        table.json('scripts').nullable().defaultTo(null);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('products');
}
