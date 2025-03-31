import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AgentWebSocketGateway } from '../agent/service/agent.connect.socket.service';
import { ComputerService } from './comp.service';

@Controller('v1/application')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Application')
@ApiBearerAuth()
export class ComputerController {
    constructor(
        private readonly compService: ComputerService,
        private readonly agenGateway: AgentWebSocketGateway,
    ) {}

    @Get('computer/all')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getAllComputers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
      const agentConnections = this.agenGateway['agentConnections']
        return this.compService.getAllComputers(Number(page), Number(limit) , agentConnections);
    }

    @Get('computer/:id')

    async getComputerById(@Param('id') id: string) {
        return this.compService.getComputerById(id);
    }

    @Get(':computerId')
    @ApiParam({ name: 'computerId', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getApplicationByComputerId(
        @Param('computerId') computerId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.compService.getApplicationByComputerId(computerId, Number(page), Number(limit));
    }
}
