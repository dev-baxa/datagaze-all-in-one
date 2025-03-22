import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('products', table => {
    
  })
}


export async function down(knex: Knex): Promise<void> {
}

