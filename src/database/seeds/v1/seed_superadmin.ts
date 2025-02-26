import { Knex } from "knex";
import { generateHashedPassword } from "src/common/utils/generate_hashed_password";
import { Role } from "src/modules/v1/auth/entities/role.interface";
import  * as bcrypt from 'bcrypt'

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("users").del();


    const role: Role = await knex('roles').where({name: 'superAdmin'}).first();
    const password: string = await bcrypt.hash('supperAdmin' , 10 )


    // Inserts seed entries
    await knex("users").insert([
        {  username: 'superAdmin' , email:"exapmle@gmail.com", password: password , role_id: role.id },
   ]);
};
