import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    table.dropColumn('os_type')
    table.dropColumn('scripts')
    table.dropColumn('path')
    table.dropColumn('version')
    table.string('agent_version').nullable().defaultTo(null);
    table.string('publisher').nullable().defaultTo(null);
    table.text('install_scripts').nullable().defaultTo(null);
    table.text('update_scripts').nullable().defaultTo(null);
    table.text('delete_scripts').nullable().defaultTo(null);
    table.string('server_path').nullable().defaultTo(null);
    table.string('agent_path').nullable().defaultTo(null);
    table.string('server_version').nullable().defaultTo(null);

  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    table.dropColumn('publisher')
    table.dropColumn('install_scripts')
    table.dropColumn('update_scripts')
    table.dropColumn('delete_scripts')
    table.dropColumn('server_path')
    table.dropColumn('agent_path')
    table.dropColumn('agent_version')
    table.dropColumn('server_version')
    table.string('os_type').defaultTo('linux'); 
    table.json('scripts').nullable().defaultTo(null);
    table.string('path').notNullable();
    table.string('version').nullable();
  })
}

