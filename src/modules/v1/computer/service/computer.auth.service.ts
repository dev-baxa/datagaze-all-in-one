import { Injectable } from '@nestjs/common';
import * as jose from 'jose';
import { ENV } from 'src/config/env';
import { CreateComputerDTO } from '../dto/create.computer.dto';
import {  ComputerInterface } from '../entity/computer.interface';

@Injectable()
export class ComputerAuthService {
    constructor() {}
    private secretKey = ENV.JWT_PRIVAT_KEY || '';

    async generateToken(data: CreateComputerDTO): Promise<string> {
        const secret = await jose.importPKCS8(this.secretKey, 'RSA-OAEP');
        const token = await new jose.EncryptJWT({ ...data })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            .encrypt(secret);

        return token;
    }

    async verifyToken(token: string): Promise<object> {
        const secret = await jose.importPKCS8(this.secretKey, 'RSA-OAEP');

        const { payload } = await jose.jwtDecrypt(token, secret);

        return payload as unknown as ComputerInterface;
    }
}
