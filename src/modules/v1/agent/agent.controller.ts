import { Body, Controller, Get, Post, Put, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthForComputersGuard } from 'src/common/guards/jwt.auth.for.computers.guard';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create.agent.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';
import { Response } from 'express';

@Controller('agent')
export class AgentController {
    constructor(private readonly computerService: AgentService) {}

    @Post('create')
    async createAgent(@Body() body: CreateAgentDto , @Res() res: Response) {
        const result = await this.computerService.createComputerAndReturnToken(body);

      return res.status(result.statusCode).json({

        token: result.token,
        // statusCode : result.statusCode
      });
    }

    @Put('applications')
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
    @Get('applications')
    async getApplications() {
        const result = await this.computerService.getApplications();
        return result;
    }
}
