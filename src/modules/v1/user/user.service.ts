import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import { generateHashedPassword } from 'src/common/utils/bcrypt.functions';
import db from 'src/config/database.config';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Role } from '../auth/entities/role.interface';
import { User } from '../auth/entities/user.interface';
import { UpdateProfilDtoForSuperAdmin } from './dto/update.profil.for.superadmin.dto';
import { UpdatePasswordDTOForSuperAdmin } from './dto/update_password.dto.forSuperAdmin';

@Injectable()
export class UserService extends BaseService<User> {
    constructor() {
        super('users');
    }

    async register(dto: CreateUserDto): Promise<User> {
        const isValidUsername = await this.findByQueryOne({ username: dto.username });
        if (isValidUsername) throw new BadRequestException('This username already register');

        const isValidEmail = await this.findByQueryOne({ email: dto.email });
        if (isValidEmail) throw new BadRequestException('This email already register');

        const role = await db('roles').where({ name: 'admin' }).first();

        dto.role_id = role.id;

        dto.password = await generateHashedPassword(dto.password);

        const user: User = await this.create(dto);

        return user;
    }
    async updatePassword(dto: UpdatePasswordDTOForSuperAdmin): Promise<void> {
        const fullUser = await this.findByQueryOne({ id: dto.user_id });
        if (!fullUser) throw new NotFoundException('User not found');

        await this.update(dto.user_id, {
            password: await generateHashedPassword(dto.new_password),
        });
    }

    async updateProfil(dto: UpdateProfilDtoForSuperAdmin): Promise<void> {
        const user = await this.findById(dto.id);
        if (!user) throw new NotFoundException('User not found');

        if (dto.username && dto.username !== user.username) {
            const existingUsername = await this.findByQueryOne({ username: dto.username });
            if (existingUsername) throw new BadRequestException('Username already taken');
        }

        if (dto.email && dto.email !== user.email) {
            const existingEmail = await this.findByQueryOne({ email: dto.email });
            if (existingEmail) throw new BadRequestException('Email already registered');
        }

        if (dto.password) dto.password = await generateHashedPassword(dto.password);

        await this.update(dto.id, dto);
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('User not found');

        await this.delete(id);
    }

    async getAllUsers(
        page: number,
        limit: number,
    ): Promise<{ users: User[]; total: number; page: number }> {
        const superAdminRole: Role = await db('roles').where({ name: 'superAdmin' }).first();

        const total = await db('users')
            .whereNot({ role_id: superAdminRole.id })
            .count('id as total');

        const offset = (page - 1) * limit;

        const users = await db('users')
            .whereNot({ role_id: superAdminRole.id })
            .select('id', 'username', 'email', 'created_at')
            .limit(limit)
            .offset(offset);

        return {
            users,
            total: Number(total[0].total),
            page,
        };
    }

    async getOneUser(id: string): Promise<User> {
        const user = await db('users').where({ id }).select('id', 'username', 'email').first();
        if (!user) throw new NotFoundException('User not found');

        return user;
    }
}
