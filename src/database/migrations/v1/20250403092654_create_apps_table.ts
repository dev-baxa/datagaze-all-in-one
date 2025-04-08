import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('apps', table => {
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
        table.uuid('computer_id').references('id').inTable('computers').onDelete('CASCADE');
        table.string('name');
        table.string('version');
        table.timestamp('installed_date');
        table.string('type');
        table.integer('size');
        table.timestamps(false, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('apps');
}
