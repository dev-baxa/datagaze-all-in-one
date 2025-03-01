import * as bycrypt from 'bcrypt';
import * as jose from 'jose';

import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import { comparePassword, generateHashedPassword } from 'src/common/utils/bcrypt.functions';
import db from 'src/config/database.config';
import { ENV } from 'src/config/env';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDTOauth } from './dto/updata_password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { Payload } from './entities/token.interface';
import { User } from './entities/user.interface';

@Injectable()
export class AuthService extends BaseService<User> {
    private saltRounds = 10;
    private privateKey = ENV.JWT_PRIVAT_KEY || '';

    constructor() {
        super('users');
    }

    async createToken(dto: LoginUserDto): Promise<string> {
        const user = await this.findByQueryOne({ username: dto.username });
        if (!user) throw new NotFoundException('User not found');

        const isPasswordMatch = await comparePassword(dto.password, user.password);

        if (!isPasswordMatch) throw new UnauthorizedException('Password is incorrect');

        const userWithRole = await this.findUserWithRole(user.id);

        if (!userWithRole) {
            throw new NotFoundException('User role not found');
        }

        const token = await this.generateTokenEncryptedJwt({
            id: user.id,
            username: userWithRole.username,
            role: userWithRole.role,
            email: userWithRole.email,
        });

        return token;
    }

    async updateProfil(dto: UpdateProfileDTO, user: Payload): Promise<void> {
        if (dto.username && dto.username !== user.username) {
            const existingUsername = await this.findByQuery({
                username: dto.username,
            });
            if (existingUsername[0]) {
                throw new BadRequestException('Username already taken');
            }
        }

        if (dto.email && dto.email !== user.email) {
            const existingEmail = await this.findByQuery({
                email: dto.email,
            });
            if (existingEmail[0]) {
                throw new BadRequestException('Email already registered');
            }
        }

        // Update user profile
        await this.update(user.id, dto);
    }

    async generateTokenEncryptedJwt(payload: Payload): Promise<string> {
        const secret = await jose.importPKCS8(this.privateKey, 'RSA-OAEP');
        const token = await new jose.EncryptJWT({ ...payload })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            // .setExpirationTime(Math.floor(Date.now() / 1000) + (60 * 60)*24)
            .encrypt(secret);
        return token;
    }

    async updatePassword(dto: UpdatePasswordDTOauth, user: Payload): Promise<void> {
        const fullUser = await this.findById(user.id);

        console.log(fullUser);

        const isPasswordMatch = await comparePassword(dto.old_password, fullUser.password);

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Password is incorrect');
        }

        await this.update(user.id, { password: await generateHashedPassword(dto.new_password) });
    }

    async decryptJWT(encryptedToken: string): Promise<Payload> {
        const secret = await jose.importPKCS8(this.privateKey, 'RSA-OAEP');
        const { payload } = await jose.jwtDecrypt(encryptedToken, secret);
        return payload as unknown as Payload;
    }

    async findByQueryOne(query: object) {
        const user = await db('users').where(query).first();
        return user;
    }
    async findById(id: string) {
        const user = await db('users').where({ id: id }).first();
        return user;
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bycrypt.compare(password, hash);
    }

    async findUserWithRole(id: string): Promise<(User & { role: string }) | null> {
        const joinData = await db('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.id', id)
            .select('users.*', 'roles.name as role');
        return joinData[0];
    }
}
