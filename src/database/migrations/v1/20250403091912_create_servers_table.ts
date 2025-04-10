import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('servers', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        // Removed 'name' in 20250330181440_update_server
        table.string('ip_address').notNullable();
        table.integer('port').notNullable();
        table.enum('os_type', ['linux', 'windows', 'macOs']).defaultTo('linux'); // From 20250219125446_update_servers
        table.string('username').nullable(); // From 20250219125446_update_servers
        // password and private_key were dropped in 20250402040051_update_servers
        table.timestamps(false, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('servers');
}
