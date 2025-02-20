import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('servers', table => {
        table.dropColumn('status');
        table.dropColumn('user_id');
        table.dropColumn('specifications');
        table.enum('os_type', ['linux', 'windows', 'macOs']).defaultTo('linux');
        table.string('username').nullable();
        table.string('password').nullable().defaultTo(null);
        table.text('private_key').nullable().defaultTo(null);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('servers', table => {
        table.string('status').defaultTo('active');
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.jsonb('specifications').nullable();
        table.dropColumn('username');
        table.dropColumn('password');
        table.dropColumn('private_key');
    });
}
