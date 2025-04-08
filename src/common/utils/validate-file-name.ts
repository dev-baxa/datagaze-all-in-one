import * as path from 'path';

import { BadRequestException } from '@nestjs/common';

export function validateFilename(filename: string): string {
    const allowedExtensions = ['rar', 'gz', 'zip', 'exe'];

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new BadRequestException(
            'Invalid file path. Path traversal or unsafe characters are not allowed.',
        );
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
        throw new BadRequestException(
            `The file extension .${ext} is not allowed. Please use a valid file type.`,
        );
    }

    const uploadsDir = path.resolve('uploads/applications');
    const fullPath = path.resolve(uploadsDir, filename);

    if (!fullPath.startsWith(uploadsDir)) {
        throw new BadRequestException(
            'Invalid file path. Access outside the upload directory is not allowed.',
        );
    }

    return fullPath;
}
