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
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDTOauth } from './dto/updata_password.dto';
// import { Request } from 'express';

@Controller('v1/auth')
@UseFilters(HttpExceptionFilter)
@ApiNotFoundResponse('username')
@ApiInternalServerErrorResponse('Internal Server Error')
@ApiBearerAuth()
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
    @ApiUnauthorizedResponse()
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
    }
}
