import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('products', table => {
      table.boolean('is_installed').defaultTo(false);
      table.string('version').defaultTo('1.0.0');
      table.string('name')
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('products', table => {
      table.dropColumn('is_installed');
      table.dropColumn('version')
      table.dropColumn('name')
    });
}
