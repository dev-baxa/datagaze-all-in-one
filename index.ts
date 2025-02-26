import { Injectable } from '@nestjs/common';
import { Client } from 'ssh2';
import * as fs from 'fs';
import { promisify } from 'util';

@Injectable()
export class SshReverseTransferService {
    private sshConfig = {
        host: 'remote-server-ip',
        username: 'your-username',
        password: 'your-password', // yoki privateKey ishlatish mumkin
        port: 22,
    };

    async transferAndInstallApp(localFilePath: string, remoteFilePath: string) {
        return new Promise((resolve, reject) => {
            const conn = new Client();

            conn.on('ready', () => {
                console.log("SSH ulanish muvaffaqiyatli o'rnatildi");

                // 1-qadam: Faylni ko'chirish uchun SFTP sessiya yaratish
                conn.sftp((err, sftp) => {
                    if (err) {
                        conn.end();
                        return reject(`SFTP sessiya ochishda xatolik: ${err.message}`);
                    }

                    console.log(`Fayl ko'chirish boshlandi: ${localFilePath} -> ${remoteFilePath}`);

                    // 2-qadam: Faylni lokal serverdan remote serverga ko'chirish
                    sftp.fastPut(localFilePath, remoteFilePath, err => {
                        if (err) {
                            conn.end();
                            return reject(`Faylni ko'chirishda xatolik: ${err.message}`);
                        }

                        console.log("Fayl muvaffaqiyatli ko'chirildi");

                        // 3-qadam: Faylni remote serverda ochish va o'rnatish
                        conn.exec(
                            `tar -xzf ${remoteFilePath} -C /tmp/extracted_app`,
                            (err, stream) => {
                                if (err) {
                                    conn.end();
                                    return reject(`Arxivni ochishda xatolik: ${err.message}`);
                                }

                                let errorOutput = '';

                                stream.stderr.on('data', data => {
                                    errorOutput += data.toString();
                                });

                                stream.on('close', code => {
                                    if (code !== 0) {
                                        conn.end();
                                        return reject(
                                            `Arxivni ochishda xatolik, chiqish kodi: ${code}, xatolik: ${errorOutput}`,
                                        );
                                    }

                                    console.log('Fayl arxivdan chiqarildi');

                                    // 4-qadam: Applicationni o'rnatish (npm install)
                                    conn.exec(
                                        'cd /tmp/extracted_app && npm install',
                                        (err, stream) => {
                                            if (err) {
                                                conn.end();
                                                return reject(
                                                    `NPM o'rnatishda xatolik: ${err.message}`,
                                                );
                                            }

                                            let errorOutput = '';

                                            stream.stderr.on('data', data => {
                                                errorOutput += data.toString();
                                            });

                                            stream.on('close', code => {
                                                if (code !== 0) {
                                                    conn.end();
                                                    return reject(
                                                        `NPM o'rnatishda xatolik, chiqish kodi: ${code}, xatolik: ${errorOutput}`,
                                                    );
                                                }

                                                console.log("NPM paketlari o'rnatildi");

                                                // 5-qadam: Applicationni ishga tushirish
                                                conn.exec(
                                                    'cd /tmp/extracted_app && npm start',
                                                    (err, stream) => {
                                                        if (err) {
                                                            conn.end();
                                                            return reject(
                                                                `Applicationni ishga tushirishda xatolik: ${err.message}`,
                                                            );
                                                        }

                                                        console.log('Application ishga tushirildi');
                                                        conn.end();
                                                        resolve({
                                                            success: true,
                                                            message:
                                                                "Application muvaffaqiyatli o'rnatildi va ishga tushirildi",
                                                        });
                                                    },
                                                );
                                            });
                                        },
                                    );
                                });
                            },
                        );
                    });
                });
            });

            conn.on('error', err => {
                reject(`SSH ulanish xatoligi: ${err.message}`);
            });

            conn.connect(this.sshConfig);
        });
    }

    // Faylni tekshirish
    async checkLocalFile(filePath: string): Promise<boolean> {
        try {
            await promisify(fs.access)(filePath);
            return true;
        } catch {
            return false;
        }
    }
}
