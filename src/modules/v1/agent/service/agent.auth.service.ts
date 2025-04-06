import { Injectable } from '@nestjs/common';
import * as jose from 'jose';
import { env } from 'src/config/env';

import { IAgentTokenPayloadInterface } from '../entity/agent.token.payload.interface';
import { IComputerPayload } from '../entity/computer.interface';

@Injectable()
export class AgentAuthService {
    constructor() {}
    private publicKey = env.JWT_PUBLIC_KEY || '';
    private privateKey = env.JWT_PRIVAT_KEY || '';

    async generateToken(data: IAgentTokenPayloadInterface): Promise<string> {
        const secret = await jose.importSPKI(this.publicKey, 'RSA-OAEP');
        const token = await new jose.EncryptJWT({ ...data })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24)
            .encrypt(secret);

        return token;
    }

    async verifyToken(token: string): Promise<IComputerPayload> {
        const secret = await jose.importPKCS8(this.privateKey, 'RSA-OAEP');

        const { payload } = await jose.jwtDecrypt(token, secret);

        return payload as unknown as IComputerPayload;
    }
}
