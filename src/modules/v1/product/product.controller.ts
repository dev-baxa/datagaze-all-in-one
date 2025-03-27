import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { fileFieldsConfig } from 'src/config/file.fields.config';
import { iconConfig } from 'src/config/icon.config';
import { CreateProductDTO } from './dto/create.product.dto';
import { ProductService } from './product.service';

@Controller('v1/product')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBadRequestResponse()
@ApiUnauthorizedResponse()
    @ApiBearerAuth()
    @ApiTags('Product')
@ApiInternalServerErrorResponse('Internal Server Error')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post('create')
    @Roles('superAdmin')
    @ApiOperation({ summary: 'Upload file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', iconConfig()))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body(new ValidationPipe()) dto: CreateProductDTO,
    ) {
        const result = await this.productService.createProduct(file, dto);
        return {
            succes: true,
            id: result,
        };
    }

    @Post(':id/files')
    @Roles('superAdmin')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'server', maxCount: 1 },
                { name: 'agent', maxCount: 1 },
            ],
            fileFieldsConfig(),
        ),
    )
    async uploadFiles(
        @Param('id') productId: string,
        @UploadedFiles() files: { server?: Express.Multer.File; agent?: Express.Multer.File },
    ) {
        this.productService.uploadFiles(productId, files);
        return {
            message: 'succes',
            id: productId,
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
}
