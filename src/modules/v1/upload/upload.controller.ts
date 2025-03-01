import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExportedJWKSCache } from 'jose';
import { UploadFileDTO } from './dto/uploadFileDto';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body(new ValidationPipe()) body: UploadFileDTO,
    ) {
        const uploadPath = this.uploadService.generateUploadPath(
            body.product_name,
            body.os_type,
            body.version,
        );

        const filePath = this.uploadService.saveFile(file, uploadPath);

        return {
            status: 'success',
            message: 'File uploaded successfully',
            path: filePath,
        };
    }
}
