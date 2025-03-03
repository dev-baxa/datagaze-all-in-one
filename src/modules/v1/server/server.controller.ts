import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { CreateServerDTO } from './dto/create.server.dto';
import { ServerInterface } from './entities/server.interface';
import { ServerService } from './server.service';

@Controller('server')
export class ServerController {
    constructor(private readonly serverService: ServerService) {}

    @Post('create')
    async create(@Body(new ValidationPipe()) dto: CreateServerDTO) {
        const server: ServerInterface = await this.serverService.create(dto);
        return { id: server.id, message: 'Server created successfully' };
    }

    @Get('find-one/:id')
    async findOneById(@Param('id') id: string) {
        const server: ServerInterface | null = await this.serverService.findById(id);
        if (server === null) throw new NotFoundException('This Serrver not found');
        return { sercces: true, server: server };
    }
}
