import * as jose from 'jose';

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import { comparePassword, generateHashedPassword } from 'src/common/utils/bcrypt.functions';
import db from 'src/config/database.config';
import { ENV } from 'src/config/env';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDTOauth } from './dto/updata_password.dto';
import { Payload } from './entities/token.interface';
import { User } from './entities/user.interface';

@Injectable()
export class AuthService extends BaseService<User> {
    private privateKey = ENV.JWT_PRIVAT_KEY || '';
    private publicKey = ENV.JWT_PUBLIC_KEY || '';

    constructor() {
        super('users');
    }

    async createToken(dto: LoginUserDto): Promise<string> {
        const user: User & { role: string } = await db('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.username', dto.username)
            .select('users.*', 'roles.name as role')
            .first();

        if (!user) throw new NotFoundException('User not found');

        const isPasswordMatch = await comparePassword(dto.password, user.password);

        if (!isPasswordMatch) throw new UnauthorizedException('Password is incorrect');

        const token = await this.generateTokenEncryptedJwt({
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
        });

        return token;
    }

    private async generateTokenEncryptedJwt(payload: Payload): Promise<string> {
        const secret = await jose.importSPKI(this.publicKey, 'RSA-OAEP');
        const token = await new jose.EncryptJWT({ ...payload })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24)
            .encrypt(secret);
        return token;
    }

    async updatePassword(dto: UpdatePasswordDTOauth, user: Payload): Promise<void> {
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

    async decryptJWT(encryptedToken: string): Promise<Payload> {
        const secret = await jose.importPKCS8(this.privateKey, 'RSA-OAEP');
        const { payload } = await jose.jwtDecrypt(encryptedToken, secret);
        return payload as unknown as Payload;
    }
}
