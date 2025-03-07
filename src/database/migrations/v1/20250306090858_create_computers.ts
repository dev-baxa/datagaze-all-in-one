import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('computers', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').notNullable();
      table.string('computer_name').notNullable()
      table.string('mac_address').unique().notNullable();
      table.integer('ram').notNullable();
      table.integer('storage').notNullable()

    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('computers');
}
