import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { userGetAllResponse, userGetOneResponse } from 'src/common/swagger/succes.response';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateProfilDtoForSuperAdmin } from './dto/update.profil.for.superadmin.dto';
import { UserService } from './user.service';

@Controller({
    path: 'user',
    version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@ApiForbiddenResponse()
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get('all')
    @Roles('superAdmin')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiSuccessResponse('data', userGetAllResponse)
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const data = await this.userService.getAllUsers(Number(page), Number(limit));

        return {
            succes: true,
            ...data,
        };
    }

    @Get(':id')
    @Roles('superAdmin')
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiSuccessResponse('user', userGetOneResponse)
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const user = await this.userService.getOneUser(id);
        return {
            succes: true,
            user,
        };
    }

    @Post('register')
    @Roles('superAdmin')
    @ApiSuccessResponse('id', '123e4567-e89b-12d3-a456-426614174000')
    async register(@Body(new ValidationPipe()) dto: CreateUserDto) {
        const user = await this.userService.register(dto);
        return {
            succes: true,
            id: user.id,
            message: 'User created successfully',
        };
    }

    @Put('update')
    @Roles('superAdmin')
    @ApiSuccessResponse('message', 'User updated successfully.')
    @ApiBadRequestResponse('Invalid data')
    @ApiNotFoundResponse('User')
    async update(@Body(new ValidationPipe()) dto: UpdateProfilDtoForSuperAdmin) {
        await this.userService.updateProfil(dto);
        return {
            succes: true,
            message: 'User updated successfully.',
        };
    }

    @Delete(':id')
    @Roles('superAdmin')
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiSuccessResponse('message', 'User deleted successfully')
    @ApiNotFoundResponse('User not found')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.userService.deleteUser(id);

        return {
            succes: true,
            message: 'User deleted successfully',
        };
    }
}
