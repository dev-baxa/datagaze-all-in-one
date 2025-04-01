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
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Create a product with file upload' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Create product with file upload',
        schema: {
            required: ['icon', 'server', 'agent'],
            type: 'object',
            properties: {
                icon: {
                    type: 'string',
                    format: 'binary',
                    description: 'Product icon file',
                },
                server: {
                    type: 'string',
                    format: 'binary',
                    description: 'Server file',
                },
                agent: {
                    type: 'string',
                    format: 'binary',
                    description: 'Agent file',
                },
                name: { type: 'string', example: 'DLP', description: 'Product name' },
                publisher: { type: 'string', example: 'DATAGAZE', description: 'Publisher name' },
                server_version: { type: 'string', example: '1.0.0', description: 'Server version' },
                agent_version: { type: 'string', example: '1.0.0', description: 'Agent version' },
                install_scripts: {
                    type: 'string',
                    example: 'echo "hello world"',
                    description: 'Install scripts',
                },
                update_scripts: {
                    type: 'string',
                    example: 'echo "update script"',
                    description: 'Update scripts',
                },
                delete_scripts: {
                    type: 'string',
                    example: 'echo "delete script"',
                    description: 'Delete scripts',
                },
                description: {
                    type: 'string',
                    example: 'This is a product description',
                    description: 'Product description',
                },
                min_requirements: {
                    type: 'string',
                    example: '4GB RAM, 2 CPUs',
                    description: 'Minimum requirements',
                },
            },
        },
    })
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
    ) {
        const result = await this.productService.createProduct(files, dto);
        return {
            success: true,
            id: result,
        };
    }

    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Agent and server files upload',
        schema: {
            type: 'object',
            properties: {
                server: {
                    type: 'string',
                    format: 'binary',
                    description: 'Server file',
                },
                agent: {
                    type: 'string',
                    format: 'binary',
                    description: 'Agent file',
                },
            },
        },
    })
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
