import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CryptoService {
    private readonly secretKey: string = 'your-256-bit-secret';
    constructor() {} // Use a secure key

    encrypt(text: string): string {
        const ciphertext = CryptoJS.AES.encrypt(text, this.secretKey).toString();
        return ciphertext;
    }

    decrypt(ciphertext: string): string {
        const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    }
}
