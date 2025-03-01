import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { fileUploadDir } from 'src/common/constants';
import { Roles } from 'src/common/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ServerService } from '../server/server.service';
import { CreateProfilDTO } from './dto/create.product.dto';
import { ProductService } from './product.service';

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly serverService: ServerService,
    ) {}

    @Post('create')
    @Roles('superAdmin')
    async create(@Body(new ValidationPipe()) dto: CreateProfilDTO) {
        const result = await this.productService.create(dto);
        return {
            id: result.id,
            message: 'Product created successfully',
        };
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: fileUploadDir,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname); // Fayl kengaytmasini olish
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedFileTypes = ['zip', 'rar', 'exe', 'deb'];
                if (!allowedFileTypes.includes(file.mimetype.split('/')[1])) {
                    return callback(new BadRequestException('Unsupported file type'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 1024 * 1024 * 10,
            },
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            message: 'File successfully upload',
            fileName: file.filename,
            path: fileUploadDir + '/' + file.filename,
        };
    }
    @Get('all')
    async findAll() {
        return await this.productService.getAllProducts();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const result: any = await this.productService.findByOne(id);

        if (!result) throw new NotFoundException('Product not found');
        console.log(result.scripts);
        return result;
    }

    @Delete('delete/:id')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        const product = await this.productService.findById(id);
        if (!product) throw new NotFoundException('This product not found');
        await this.productService.delete(id);
        return {
            succes: true,
            message: 'Product deleted successfully',
        };
    }

    // @Post('install')
    // async install(@Body(new ValidationPipe()) dto : ProductInstallDTO)
}
