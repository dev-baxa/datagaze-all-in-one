import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('ssh_logs', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('server_id').references('id').inTable('servers').onDelete('CASCADE');
        table.string('status').notNullable();
        table.text('error_msg').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('ssh_logs');
}
