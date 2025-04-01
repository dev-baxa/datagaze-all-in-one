import { Injectable } from '@nestjs/common';
import * as jose from 'jose';
import db from 'src/config/database.config';
import { ENV } from 'src/config/env';
import { ComputerPayloadInterface } from '../entity/computer.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AgentAuthService {
    constructor() { }
    private publicKey = ENV.JWT_PUBLIC_KEY || '';
    private privateKey = ENV.JWT_PRIVAT_KEY || '';

    async generateToken(data): Promise<string> {
        const secret = await jose.importSPKI(this.publicKey, 'RSA-OAEP');
        const token = await new jose.EncryptJWT({ ...data })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24)
            .encrypt(secret);

        return token;
    }

    async verifyToken(token: string): Promise<ComputerPayloadInterface> {
        const secret = await jose.importPKCS8(this.privateKey, 'RSA-OAEP');

        const { payload } = await jose.jwtDecrypt(token, secret);

        return payload as unknown as ComputerPayloadInterface;
    }
}
