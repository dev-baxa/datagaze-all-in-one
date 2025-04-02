import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('servers', table => {
    table.dropColumn('password'),
    table.dropColumn('private_key')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('servers', table => {
    table.string('password').nullable().defaultTo(null);
    table.string('private_key').nullable().defaultTo(null);
  })
}

