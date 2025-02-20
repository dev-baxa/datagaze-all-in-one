import { Body, Controller, Get, Injectable, NotFoundException, Param, Post, ValidationPipe } from "@nestjs/common";
import { ServerService } from "./server.service";
import { CreateServerDTO } from "./dto/create.server.dto";
import { Server } from "./entities/server.interface";

@Controller('server')
export class ServerController{
    constructor(private readonly serverService : ServerService){}

    @Post('create')
    async create(@Body( new ValidationPipe() )  dto: CreateServerDTO ){
        const server : Server = await this.serverService.create(dto)
        return { id :server.id , message: 'Server created successfully'}
    }

    @Get('find-one/:id')
    async findOneById(@Param('id') id:string ){
        
        const server: Server| null = await this.serverService.findById(id)
        if(server===null) throw new NotFoundException("This Serrver not found")
        return { sercces: true , server: server }
    }

}