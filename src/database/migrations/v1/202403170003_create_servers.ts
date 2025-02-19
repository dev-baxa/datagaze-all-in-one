import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('servers', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNullable();
        table.string('ip_address').notNullable();
        table.integer('port').notNullable();
        table.string('status').defaultTo('active');
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.jsonb('specifications').nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('servers');
}
