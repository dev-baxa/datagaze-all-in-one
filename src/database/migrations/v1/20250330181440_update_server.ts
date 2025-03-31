import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('servers', table => {
    table.dropColumn('name')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('servers', table => {
    table.string('name')
  })
}

