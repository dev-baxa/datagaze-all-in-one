import { log } from 'console';
import { createReadStream } from 'fs';

import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthForComputersGuard } from 'src/common/guards/jwt.auth.for.computers.guard';
import {
    ApiNotFoundResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { validateFilename } from 'src/common/utils/validate-file-name';

import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create.agent.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';
import { IComputer } from './entity/computer.interface';

@Controller('agent')
@ApiNotFoundResponse('Agent')
@ApiTags('Agent')
export class AgentController {
    constructor(private readonly computerService: AgentService) {}

    @Post('create')
    @HttpCode(200 | 201)
    @ApiSuccessResponse('token', 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...')
    async createAgent(@Body() body: CreateAgentDto, @Res() res: Response): Promise<Response> {
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
        @Req() req: Request & { computer: IComputer },
    ): Promise<{ message: string }> {
        await this.computerService.updateApplications(body, req.computer);

        return {
            message: 'Applications updated successfully',
        };
    }

    @Get('files/:filename')
    // @UseGuards(JwtAuthForComputersGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'filename', description: 'Name of the file to retrieve', required: true })
    async getFile(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
        const filePath = validateFilename(filename);
        log('filePath', filePath);
        const stream = createReadStream(filePath);
        res.setHeader('Content-Type', `application/octet-stream`);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        stream.pipe(res);
    }
}
