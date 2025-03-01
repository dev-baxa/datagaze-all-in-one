import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Request,
    UseFilters,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDTOauth } from './dto/updata_password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
// import { Request } from 'express';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(new ValidationPipe()) dto: LoginUserDto) {
        const token = await this.authService.createToken(dto);
        return {
            status: 'success',
            token,
        };
    }
    @Put('update-password')
    @UseGuards(JwtAuthGuard)
    async updatePassword(
        @Body(new ValidationPipe()) dto: UpdatePasswordDTOauth,
        @Request() Request,
    ) {
        const user = Request.user;

        await this.authService.updatePassword(dto, user);

        return {
            status: 'success',
            message: 'Password updated successfully.',
        };
        // } else if (dto.user_id) {
        //     if (user.role !== 'superAdmin') {
        //         throw new UnauthorizedException('Only superadmins can update passwords');
        //     }

        //     // dto.new_password = await this.authService.hashPassword(dto.new_password);

        //     await this.authService.update(dto.user_id, { password: dto.new_password });

        //     return {
        //         status: 'success',
        //         message: 'Password updated successfully. Provide it physically to the user.',
        //     };
        // } else {
        //     throw new BadRequestException('Bad request body');
        // }
    }

    @Put('update-profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateProfile(@Body(new ValidationPipe()) dto: UpdateProfileDTO, @Request() Request) {
        const user = Request.user;

        // Check if username is being changed and validate uniqueness
        await this.authService.updateProfil(dto, user);

        return {
            status: 'success',
            message: 'Profile updated successfully',
        };
    }
}
