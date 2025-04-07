import * as fs from 'fs';
import * as path from 'path';

import { WsException } from '@nestjs/websockets';
import * as ssh from 'ssh2';

export async function uploadFile(
    sftp: ssh.SFTPWrapper,
    localFilePath: string,
    progressCallback?: (progress: string, percentage: number) => void,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const fileSize = fs.statSync(localFilePath).size;
        const barLength = 20;
        let transferred = 0;
        const remoteFilePath = path.basename(localFilePath);

        const stream = sftp.createWriteStream(remoteFilePath);
        const readStream = fs.createReadStream(localFilePath);

        readStream.on('data', chunk => {
            transferred += chunk.length;
            const progress = Math.floor((transferred / fileSize) * barLength);
            const percentage = ((transferred / fileSize) * 100).toFixed(2);
            const progressBar = `[${'#'.repeat(progress)}${' '.repeat(barLength - progress)}]`;

            if (progressCallback) progressCallback(progressBar, parseFloat(percentage));
        });

        readStream.on('end', () => {
            stream.end();
            resolve();
        });

        readStream.on('error', err =>
            reject(new WsException(`Faylni ko'chirishda xatolik: ${err.message}`)),
        );
        stream.on('error', err => reject(new WsException(`Streamda xatolik: ${err.message}`)));

        readStream.pipe(stream);
    });
}
