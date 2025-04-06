import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
    ApiNotFoundResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';

import { AppInterface } from '../agent/entity/app.interface';
import { ComputerInterface } from '../agent/entity/computer.interface';
import { AgentWebSocketGateway } from '../agent/service/agent.connect.socket.service';
import { ComputerService } from './comp.service';

@Controller('application')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Application')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
export class ComputerController {
    constructor(
        private readonly compService: ComputerService,
        private readonly agenGateway: AgentWebSocketGateway,
    ) {}

    @Get('computer/all')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiSuccessResponse('data', 'List of computers')
    async getAllComputers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{ computers: ComputerInterface[]; total: number; page: number }> {
        const agentConnections = this.agenGateway['agentConnections'];
        return this.compService.getAllComputers(Number(page), Number(limit), agentConnections);
    }

    @Get('computer/:id')
    @ApiSuccessResponse('computer', 'Computer details')
    @ApiNotFoundResponse('Computer')
    async getComputerById(@Param('id') id: string): Promise<{ computer: ComputerInterface }> {
        return this.compService.getComputerById(id);
    }

    @Get(':computerId')
    @ApiParam({ name: 'computerId', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiNotFoundResponse('Computer')
    @ApiSuccessResponse('applications', 'List of applications')
    async getApplicationByComputerId(
        @Param('computerId') computerId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{ applications: AppInterface[]; total: number; page: number }> {
        return this.compService.getApplicationByComputerId(computerId, Number(page), Number(limit));
    }
}
