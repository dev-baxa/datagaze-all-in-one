import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthForComputersGuard } from 'src/common/guards/jwt.auth.for.computers.guard';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create.agent.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';

@ApiBearerAuth()
@Controller('v1/agent')
@ApiTags('Agent')
export class AgentController {
    constructor(private readonly computerService: AgentService) {}

    @Post('create')
    async createAgent(@Body() body: CreateAgentDto, @Res() res: Response) {
        const result = await this.computerService.createComputerAndReturnToken(body);

        return res.status(result.statusCode).json({
            token: result.token,
        });
    }

    @Post('applications')
    @UseGuards(JwtAuthForComputersGuard)
    async updateApplications(
        @Body()
        body: UpdateApplicationsDTO[],
        @Req() req,
    ) {
        await this.computerService.updateApplications(body, req.computer);

        return {
            status: 'success',
            message: 'Applications updated successfully',
        };
    }
}
