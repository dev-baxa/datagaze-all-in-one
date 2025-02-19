import * as fs from 'fs';
import * as path from 'path';

import * as bycrypt from 'bcrypt';
import * as jose from 'jose'

import { Injectable } from '@nestjs/common';
import db from 'src/config/database.config';
import { ENV } from 'src/config/env';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './entities/role.interface';
import { BaseService } from 'src/common/utils/base.service';
import { User } from './entities/user.interface';

@Injectable()
export class AuthService extends BaseService<User> {
    private saltRounds = 10;
    private privateKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'private.pem'), 'utf8');


    constructor() {
        super('users');
    }


    async generateTokenEncryptedJwt(payload: object): Promise<string> {
        const secret = await jose.importPKCS8(this.privateKey, "RSA-OAEP");
        const token = await new jose.EncryptJWT({ ...payload })
            .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })
            // .setExpirationTime(Math.floor(Date.now() / 1000) + (60 * 60)*24)
            .encrypt(secret);
        return token

    }
    async updatePassword(id: string, hawedPassword: string) {
        const updatedUser = await db('users').where({ id }).update({ password: hawedPassword, updated_at: new Date() });
        return updatedUser
    }

    async decryptJWT(encryptedToken: string) {
        const secret = await jose.importPKCS8(this.privateKey, "RSA-OAEP");
        const { payload } = await jose.jwtDecrypt(encryptedToken, secret);
        return payload;
    }

    async register(dto: CreateUserDto) {
        const user = await db('users').insert(dto).returning('*');
        return user;
    }
    async findByQuery(query: object) {
        const users = await db('users').where(query);
        return users;
    }
    async findByQueryOne(query: object) {
        const user = await db('users').where(query).first();
        return user;
    }
    async findById(id: string) {
        const user = await db('users').where({ id: id }).first();
        return user;
    }
    async hashPassword(password: string): Promise<string> {
        return await bycrypt.hash(password, this.saltRounds);
    }
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bycrypt.compare(password, hash);
    }
    async findRoleByName(name: string): Promise<Role> {
        const role = await db('roles').where({ name }).first();
        return role as Role;
    }
    async findUserWithRole(id: string): Promise<User & { role: string } | null> {
        const joinData = await db('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', id)
            .select('users.*', 'roles.name as role');
        return joinData[0];
    }

}
