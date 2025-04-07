import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
import { BaseService } from 'src/common/utils/base.service';
import { comparePassword, generateHashedPassword } from 'src/common/utils/bcrypt.functions';
import db from 'src/config/database.config';
import { env } from 'src/config/env';

import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDTOauth } from './dto/updata_password.dto';
import { IPayload } from './entities/token.interface';
import { IUser } from './entities/user.interface';
import { RedisService } from './redis.service';

@Injectable()
export class AuthService extends BaseService<IUser> {
    private privateKey = env.JWT_PRIVAT_KEY || '';
    private publicKey = env.JWT_PUBLIC_KEY || '';

    constructor(private readonly redisService: RedisService) {
        super('users');
    }

    async createToken(
        dto: LoginUserDto,
    ): Promise<Partial<IUser> & { accesToken: string; refreshToken: string; role: string }> {
        const user: IUser & { role: string } = await db('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.username', dto.username)
            .select('users.*', 'roles.name as role')
            .first();

        if (!user) throw new NotFoundException('User not found');

        const isPasswordMatch = await comparePassword(dto.password, user.password);

        if (!isPasswordMatch) throw new UnauthorizedException('Password is incorrect');

        const accessToken = await this.generateTokenEncryptedJwt({
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            type: 'access',
        });

        const refreshToken = await this.generateTokenEncryptedJwt({
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            type: 'refresh',
        });

        return {
            accesToken: accessToken,
            refreshToken: refreshToken,
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            fullname: user.fullname,
        };
    }

    async refreshToken(user: IPayload , oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const isBlacklisted = await this.redisService.exists(`blacklist:${oldToken}`);

        if (isBlacklisted) throw new UnauthorizedException('Token amal qilmaydi u Blacklistda');

        const accessToken = await this.generateTokenEncryptedJwt({
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            type: 'access',
        });

        const refreshToken = await this.generateTokenEncryptedJwt({
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            type: 'refresh',
        });

        await this.redisService.set(`blacklist:${oldToken}`, 'true', 60 * 60 * 24); // 1 kun

        return {
            accessToken,
            refreshToken,
        };
    }

    private async generateTokenEncryptedJwt(payload: IPayload): Promise<string> {
        const secret = await jose.importSPKI(this.publicKey, 'RSA-OAEP');

        const expirationTime =
            payload.type === 'access'
                ? Math.floor(Date.now() / 1000) + 60 * 60 * 2 // 2 soat
                : Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 kun

        const token = await new jose.EncryptJWT({ ...payload })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            .setExpirationTime(expirationTime)
            .encrypt(secret);
        return token;
    }

    async updatePassword(dto: UpdatePasswordDTOauth, user: IPayload): Promise<void> {
        const fullUser = await this.findById(user.id);

        if (!fullUser) {
            throw new NotFoundException('User not found');
        }

        const isPasswordMatch = await comparePassword(dto.old_password, fullUser.password);

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Password is incorrect');
        }

        await this.update(user.id, { password: await generateHashedPassword(dto.new_password) });
    }

    async decryptJWT(encryptedToken: string): Promise<IPayload> {
        const secret = await jose.importPKCS8(this.privateKey, 'RSA-OAEP');
        const { payload } = await jose.jwtDecrypt<IPayload>(encryptedToken, secret);
        return payload;
    }
}
