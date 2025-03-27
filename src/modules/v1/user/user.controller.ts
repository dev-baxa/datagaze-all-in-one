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
    ApiAuth,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateProfilDtoForSuperAdmin } from './dto/update.profil.for.superadmin.dto';
import { UpdatePasswordDTOForSuperAdmin } from './dto/update_password.dto.forSuperAdmin';
import { UserService } from './user.service';

@Controller('v1/user')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiAuth()
@ApiBadRequestResponse()
@ApiUnauthorizedResponse()
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get('all')
    @Roles('superAdmin')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const data = await this.userService.getAllUsers(Number(page), Number(limit));

        return {
            status: 'success',
            ...data,
        };
    }

    @Get(':id')
    @Roles('superAdmin')
    @ApiParam({ name: 'id', required :true , type : 'string' })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const user = await this.userService.getOneUser(id);
        return {
            status: 'success',
            user,
        };
    }

    @Post('register')
    @Roles('superAdmin')
    async register(@Body(new ValidationPipe()) dto: CreateUserDto) {
        const user = await this.userService.register(dto);
        return {
            status: 'success',
            id: user.id,
            message: 'User created successfully',
        };
    }

    @Put('update-password')
    @Roles('superAdmin')
    async updateAnotherUsersPassword(
        @Body(new ValidationPipe()) dto: UpdatePasswordDTOForSuperAdmin,
    ) {
        await this.userService.updatePassword(dto);
        return {
            status: 'success',
            message: 'Password updated successfully. Provide it physically to the user.',
        };
    }

    @Put('update')
    @Roles('superAdmin')
    async update(@Body(new ValidationPipe()) dto: UpdateProfilDtoForSuperAdmin) {
        await this.userService.updateProfil(dto);
        return {
            status: 'success',
            message: 'User updated successfully.',
        };
    }

    @Delete(':id')
    @Roles('superAdmin')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.userService.deleteUser(id);

        return {
            status: 'succes',
            message: 'User deleted successfully',
        };
    }
}
