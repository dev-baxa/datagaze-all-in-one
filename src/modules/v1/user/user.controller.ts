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
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-for-access.guard';
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
import { IUser } from '../auth/entities/user.interface';
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
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{ users: IUser[]; total: number; page: number }> {
        return this.userService.getAllUsers(Number(page), Number(limit));
    }

    @Get(':id')
    @Roles('superAdmin')
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiSuccessResponse('user', userGetOneResponse)
    async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<IUser> {
        return this.userService.getOneUser(id);
    }

    @Post('register')
    @Roles('superAdmin')
    @ApiSuccessResponse('id', '123e4567-e89b-12d3-a456-426614174000')
    async register(@Body() dto: CreateUserDto): Promise<{ id: string; message: string }> {
        const userId = await this.userService.register(dto);
        return {
            id: userId,
            message: 'User created successfully',
        };
    }

    @Put('update')
    @Roles('superAdmin')
    @ApiSuccessResponse('message', 'IUser updated successfully.')
    @ApiBadRequestResponse('Invalid data')
    @ApiNotFoundResponse('User')
    async update(@Body() dto: UpdateProfilDtoForSuperAdmin): Promise<{ message: string }> {
        await this.userService.updateProfil(dto);
        return {
            message: 'User updated successfully.',
        };
    }

    @Delete(':id')
    @Roles('superAdmin')
    @ApiParam({ name: 'id', required: true, type: 'string' })
    @ApiSuccessResponse('message', 'User deleted successfully')
    @ApiNotFoundResponse('User not found')
    async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
        await this.userService.deleteUser(id);

        return {
            message: 'User deleted successfully',
        };
    }
}
