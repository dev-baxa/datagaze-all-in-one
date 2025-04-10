import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-for-access.guard';
import { JwtAuthGuardForRefresh } from 'src/common/guards/jwt-auth-for-refresh.guard';
import {
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDTOauth } from './dto/updata_password.dto';
import { IPayload } from './entities/token.interface';
import { IUser } from './entities/user.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiNotFoundResponse('User')
    @ApiBadRequestResponse('Invalid username or password')
    @ApiSuccessResponse('accessToken', 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...')
    async login(
        @Body() dto: LoginUserDto,
    ): Promise<Partial<IUser> & { accesToken: string; refreshToken: string; role: string }> {
        return this.authService.createToken(dto);
    }

    @Put('update-password')
    @UseGuards(JwtAuthGuard)
    @ApiSuccessResponse('message', 'Password updated successfully.')
    @ApiBadRequestResponse('Invalid password')
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    async updatePassword(
        @Body() dto: UpdatePasswordDTOauth,
        @Request() Request: Request & { user: IPayload },
    ): Promise<{ message: string }> {
        const user = Request.user;

        await this.authService.updatePassword(dto, user);

        return {
            message: 'Password updated successfully.',
        };
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuardForRefresh)
    @ApiBearerAuth()
    async refresh(
        @Request() Request: Request & { user: IPayload; refresh: string },
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const user = Request.user;
        const refreshToken = Request.refresh;

        return this.authService.refreshToken(user, refreshToken);
    }
}
