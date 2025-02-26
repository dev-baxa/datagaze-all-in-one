import { extname } from 'path';

export function fileNameEditor(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname); // Fayl kengaytmasini olish
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
}
