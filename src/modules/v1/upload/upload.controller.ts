import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { multerConfig } from 'src/config/upload.config';
import { UploadFileDTO } from './dto/uploadFileDto';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post()
    @Roles('superAdmin')
    @UseInterceptors(FileInterceptor('file', multerConfig()))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body(new ValidationPipe()) body: UploadFileDTO,
    ) {
        await this.uploadService.checkProducdtExists(body.product_name);

        const uploadPath = this.uploadService.generateUploadPath(
            body.product_name,
            body.os_type,
            body.version,
        );

        const filePath = await this.uploadService.saveFile(
            file,
            uploadPath,
            body.os_type,
            body.version,
        );

        return {
            status: 'success',
            message: 'File uploaded successfully',
            path: filePath,
        };
    }
}
