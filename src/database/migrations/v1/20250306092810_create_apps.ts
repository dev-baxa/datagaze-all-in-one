import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('apps', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('computer_id').references('id').inTable('computers').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('executable_path').notNullable();
    table.integer('file_size').notNullable()
    table.timestamp('date_time').nullable().defaultTo(null);
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('apps')
}

