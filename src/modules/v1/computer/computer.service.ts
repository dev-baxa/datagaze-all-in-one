import { Injectable } from '@nestjs/common';
import * as jose from 'jose';
import { BaseService } from 'src/common/utils/base.service';
import db from 'src/config/database.config';
import { ENV } from 'src/config/env';
import { CreateComputerDTO } from './dto/create.computer.dto';
import { Computer } from './entity/computer.interface';

@Injectable()
export class ComputerService extends BaseService<Computer> {
    constructor() {
        super('computers');
    }
    private secretKey = ENV.JWT_PRIVAT_KEY || '';

    async createComputer(data: CreateComputerDTO): Promise<Computer> {
        const result = await db('computers')
            .insert(data)
            .onConflict('mac_address')
            .merge({
                mac_address: data.mac_address,
                username: data.username,
                computer_name: data.computer_name,
                ram: data.ram,
                storage: data.storage,
            })
            .returning('*');
        return result[0];
    }

    async gerateToken(data: CreateComputerDTO): Promise<string> {
        const secret = await jose.importPKCS8(this.secretKey, 'RSA-OAEP');
        const token = await new jose.EncryptJWT({ ...data })
            .setProtectedHeader({ alg: 'RSA-OAEP', enc: 'A256GCM' })
            // .setExpirationTime(Math.floor(Date.now() / 1000) + (60 * 60)*24)
            .encrypt(secret);
        return token;
    }
}
