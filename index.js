"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshReverseTransferService = void 0;
const common_1 = require("@nestjs/common");
const ssh2_1 = require("ssh2");
const fs = require("fs");
const util_1 = require("util");
let SshReverseTransferService = class SshReverseTransferService {
    constructor() {
        this.sshConfig = {
            host: 'remote-server-ip',
            username: 'your-username',
            password: 'your-password',
            port: 22,
        };
    }
    async transferAndInstallApp(localFilePath, remoteFilePath) {
        return new Promise((resolve, reject) => {
            const conn = new ssh2_1.Client();
            conn.on('ready', () => {
                console.log("SSH ulanish muvaffaqiyatli o'rnatildi");
                conn.sftp((err, sftp) => {
                    if (err) {
                        conn.end();
                        return reject(`SFTP sessiya ochishda xatolik: ${err.message}`);
                    }
                    console.log(`Fayl ko'chirish boshlandi: ${localFilePath} -> ${remoteFilePath}`);
                    sftp.fastPut(localFilePath, remoteFilePath, err => {
                        if (err) {
                            conn.end();
                            return reject(`Faylni ko'chirishda xatolik: ${err.message}`);
                        }
                        console.log("Fayl muvaffaqiyatli ko'chirildi");
                        conn.exec(`tar -xzf ${remoteFilePath} -C /tmp/extracted_app`, (err, stream) => {
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
                                    return reject(`Arxivni ochishda xatolik, chiqish kodi: ${code}, xatolik: ${errorOutput}`);
                                }
                                console.log('Fayl arxivdan chiqarildi');
                                conn.exec('cd /tmp/extracted_app && npm install', (err, stream) => {
                                    if (err) {
                                        conn.end();
                                        return reject(`NPM o'rnatishda xatolik: ${err.message}`);
                                    }
                                    let errorOutput = '';
                                    stream.stderr.on('data', data => {
                                        errorOutput += data.toString();
                                    });
                                    stream.on('close', code => {
                                        if (code !== 0) {
                                            conn.end();
                                            return reject(`NPM o'rnatishda xatolik, chiqish kodi: ${code}, xatolik: ${errorOutput}`);
                                        }
                                        console.log("NPM paketlari o'rnatildi");
                                        conn.exec('cd /tmp/extracted_app && npm start', (err, stream) => {
                                            if (err) {
                                                conn.end();
                                                return reject(`Applicationni ishga tushirishda xatolik: ${err.message}`);
                                            }
                                            console.log('Application ishga tushirildi');
                                            conn.end();
                                            resolve({
                                                success: true,
                                                message: "Application muvaffaqiyatli o'rnatildi va ishga tushirildi",
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
            conn.on('error', err => {
                reject(`SSH ulanish xatoligi: ${err.message}`);
            });
            conn.connect(this.sshConfig);
        });
    }
    async checkLocalFile(filePath) {
        try {
            await (0, util_1.promisify)(fs.access)(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.SshReverseTransferService = SshReverseTransferService;
exports.SshReverseTransferService = SshReverseTransferService = __decorate([
    (0, common_1.Injectable)()
], SshReverseTransferService);
//# sourceMappingURL=index.js.map