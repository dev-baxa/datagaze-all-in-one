import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('apps', table => {
    table.string('name').nullable().alter();
    table.integer('size').nullable().alter()
    table.string('type').nullable().alter()
    table.string('version').nullable().alter()
    table.timestamp('installed_date').nullable().alter()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('apps', table => {
    table.string('name').notNullable().alter();
    table.integer('size').notNullable().alter()
    table.string('type').notNullable().alter()
    table.string('version').notNullable().alter()
    table.timestamp('installed_date').notNullable().alter()
  })
}

