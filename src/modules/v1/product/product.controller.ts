import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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

import { CreateProductDTO } from './dto/create.product.dto';
import { Product } from './entities/product.interface';
import { createProductSwagger } from './entities/swagger.document';
import { ProductService } from './product.service';

@Controller('product')
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
    @ApiOperation({ summary: 'Create a product with file upload' })
    @ApiConsumes('multipart/form-data')
    @ApiBody(createProductSwagger)
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'icon', maxCount: 1 },
                { name: 'server', maxCount: 1 },
                { name: 'agent', maxCount: 1 },
            ],
            fileFieldsConfig(),
        ),
    )
    async create(
        @UploadedFiles()
        files: {
            icon: Express.Multer.File;
            server: Express.Multer.File;
            agent: Express.Multer.File;
        },
        @Body(new ValidationPipe()) dto: CreateProductDTO,
    ): Promise<{ id: string }> {
        const result = await this.productService.createProduct(files, dto);
        return {
            id: result,
        };
    }

    @Get('all')
    async findAll(): Promise<(Partial<Product> & { ip: string | null })[]> {
        return await this.productService.getAllProducts();
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<(Product & { ip: string | null })[]> {
        return this.productService.findByOne(id);
    }

    @Delete('delete/:id')
    async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
        const product = await this.productService.findById(id);
        if (!product) throw new NotFoundException('This product not found');
        await this.productService.delete(id);
        return {
            message: 'Product deleted successfully',
        };
    }
}
