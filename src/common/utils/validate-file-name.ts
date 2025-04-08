import path from 'path';

import { BadRequestException } from '@nestjs/common';

export function validateFilename(filename: string): string {
    const allowedExtensions = ['pdf', 'jpg', 'png', 'zip', 'exe'];

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new BadRequestException(
            'Yo‘lni aylab o‘tmoqchimisan? Qani og‘riq ichida kuylab ko‘r.',
        );
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
        throw new BadRequestException(
            `.${ext} kengaytmasi bilan o‘ynama. Serverimga mehribon bo‘l.`,
        );
    }

    const uploadsDir = path.resolve(__dirname, '../../../../uploads/applications');
    const fullPath = path.resolve(uploadsDir, filename);

    if (!fullPath.startsWith(uploadsDir)) {
        throw new BadRequestException('Sen qayerga kirmoqchisan? Bu qop-qorong‘u joy seniki emas.');
    }

    return fullPath;
}
