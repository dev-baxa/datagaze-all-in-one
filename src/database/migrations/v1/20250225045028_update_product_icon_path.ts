import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('products', table => {
        table.string('icon_path');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('products', table => {
        table.dropColumn('icon_path');
    });
}
