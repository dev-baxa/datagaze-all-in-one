import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthForComputersGuard } from 'src/common/guards/jwt.auth.for.computers.guard';
import {
    ApiNotFoundResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create.agent.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';

@Controller('v1/agent')
@ApiNotFoundResponse('Agent')
@ApiTags('Agent')
export class AgentController {
    constructor(private readonly computerService: AgentService) {}

    @Post('create')
    @HttpCode(200 | 201)
    @ApiSuccessResponse('token', 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...')
    async createAgent(@Body() body: CreateAgentDto, @Res() res: Response) {
        const result = await this.computerService.createComputerAndReturnToken(body);

        return res.status(result.statusCode).json({
            token: result.token,
        });
    }

    @Post('applications')
    @UseGuards(JwtAuthForComputersGuard)
    @ApiBody({
        description: 'Update applications',
        type: [UpdateApplicationsDTO],
    })
    @ApiSuccessResponse('message', 'Applications updated successfully')
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
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
