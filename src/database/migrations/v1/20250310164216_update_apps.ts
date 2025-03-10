import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('apps', table => {
    table.dropColumn('executable_path');
    table.dropColumn('file_size')
    table.dropColumn('date_time')
    table.integer('size').notNullable()
    table.string('type').notNullable()
    table.string('version').notNullable()
    table.timestamp('installed_date').notNullable()

  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('apps', table => { 
    table.string('executable_path').notNullable();
    table.integer('file_size').notNullable()
    table.timestamp('date_time').nullable().defaultTo(null);
    table.dropColumn('size');
    table.dropColumn('type');
    table.dropColumn('version');
    table.dropColumn('installed_date');
  })
}

