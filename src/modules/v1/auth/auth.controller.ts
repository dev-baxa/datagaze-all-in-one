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
import { ApiBearerAuth } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
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
// import { Request } from 'express';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
@ApiBearerAuth()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiNotFoundResponse('User')
    @ApiBadRequestResponse('Invalid username or password')
    @ApiSuccessResponse('token', 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...')
    async login(@Body(new ValidationPipe()) dto: LoginUserDto): Promise<{ token: string }> {
        return this.authService.createToken(dto);
    }

    @Put('update-password')
    @UseGuards(JwtAuthGuard)
    @ApiSuccessResponse('message', 'Password updated successfully.')
    @ApiBadRequestResponse('Invalid password')
    @ApiUnauthorizedResponse()
    async updatePassword(
        @Body(new ValidationPipe()) dto: UpdatePasswordDTOauth,
        @Request() Request: Request & { user: IPayload },
    ): Promise<{ message: string }> {
        const user = Request.user;

        await this.authService.updatePassword(dto, user);

        return {
            message: 'Password updated successfully.',
        };
    }
}
