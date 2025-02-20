import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Post,
    Put,
    Request,
    UnauthorizedException,
    UseFilters,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { log } from 'console';
import { UpdateProfileDTO } from './dto/update-profile.dto';
// import { Request } from 'express';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('superAdmin')
    async register(@Body(new ValidationPipe()) dto: CreateUserDto) {
        // throw new ReferenceError();
        const anotherUserWithUsername = await this.authService.findByQuery({
            username: dto.username,
        });
        if (anotherUserWithUsername[0])
            throw new BadRequestException('This username Already register');
        const anotherUser = await this.authService.findByQuery({ email: dto.email });
        if (anotherUser[0]) throw new BadRequestException('This email already register');

        dto.password = await this.authService.hashPassword(dto.password);

        const role = await this.authService.findRoleByName('admin');

        dto.role_id = role.id;

        const user: User[] = await this.authService.register(dto);

        return { id: user[0].id, message: 'User registered successfully' };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(new ValidationPipe()) dto: LoginUserDto) {
        const user = await this.authService.findByQuery({ username: dto.username });
        if (!user[0]) throw new NotFoundException('User not found');

        const isPasswordMatch = await this.authService.comparePassword(
            dto.password,
            user[0].password,
        );

        if (!isPasswordMatch) throw new UnauthorizedException('Password is incorrect');

        const userWithRole = await this.authService.findUserWithRole(user[0].id);

        if (!userWithRole) {
            throw new NotFoundException('User role not found');
        }
        console.log(user, 11);

        const token = await this.authService.generateTokenEncryptedJwt({
            id: user[0].id,
            username: userWithRole.username,
            role: userWithRole.role,
            email: userWithRole.email,
        });

        return {
            status: 'success',
            token,
        };
        // console.log(token , 'token'  , userWithRole
    }
    @Put('update-password')
    @UseGuards(JwtAuthGuard)
    async updatePassword(@Body(new ValidationPipe()) dto: UpdatePasswordDTO, @Request() Request) {
        const user = Request.user;
        if (dto.old_password) {
            const userWithPassword = await this.authService.findByQueryOne({
                username: user.username,
            });

            const isPasswordMatch = await this.authService.comparePassword(
                dto.old_password,
                userWithPassword.password,
            );
            if (!isPasswordMatch) {
                throw new UnauthorizedException('Password is incorrect');
            }

            dto.new_password = await this.authService.hashPassword(dto.new_password);

            const result = await this.authService.updatePassword(
                userWithPassword.id,
                dto.new_password,
            );

            log(result, 'result');
            return {
                status: 'success',
                message: 'Password updated successfully.',
            };
        } else if (dto.user_id) {
            if (user.role !== 'superAdmin') {
                throw new UnauthorizedException('Only superadmins can update passwords');
            }

            dto.new_password = await this.authService.hashPassword(dto.new_password);

            await this.authService.update(dto.user_id, { password: dto.new_password });

            return {
                status: 'success',
                message: 'Password updated successfully. Provide it physically to the user.',
            };
        } else {
            throw new BadRequestException('Bad request body');
        }
    }

    @Put('update-profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateProfile(@Body(new ValidationPipe()) dto: UpdateProfileDTO, @Request() Request) {
        const user = Request.user;

        // Check if username is being changed and validate uniqueness
        if (dto.username && dto.username !== user.username) {
            const existingUsername = await this.authService.findByQuery({
                username: dto.username,
            });
            if (existingUsername[0]) {
                throw new BadRequestException('Username already taken');
            }
        }

        // Check if email is being changed and validate uniqueness
        if (dto.email && dto.email !== user.email) {
            const existingEmail = await this.authService.findByQuery({
                email: dto.email,
            });
            if (existingEmail[0]) {
                throw new BadRequestException('Email already registered');
            }
        }

        // Update user profile
        await this.authService.update(user.id, dto);

        return {
            status: 'success',
            message: 'Profile updated successfully',
        };
    }
}
