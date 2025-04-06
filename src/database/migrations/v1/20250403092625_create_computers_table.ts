import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('computers', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('hostname').nullable();
        table.string('operation_system').nullable();
        table.string('platform').nullable();
        table.string('build_number').nullable();
        table.jsonb('network_adapters').notNullable();
        table.jsonb('disks').notNullable();
        table.string('unical_key').unique().notNullable();
        table.string('version').nullable();
        table.integer('ram').nullable();
        table.string('cpu').nullable();
        table.string('model').nullable();
        table.integer('cores').nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('computers');
}
