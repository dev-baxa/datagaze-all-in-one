import {
    Controller,
    Get,
    Header,
    NotFoundException,
    Param,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { JwtAuthForComputersGuard } from 'src/common/guards/jwt.auth.for.computers.guard';
import { AgentAuthService } from './service/agent.auth.service';

@Controller('apps')
export class FileController {
    constructor(private readonly agentAuthService: AgentAuthService) {}

    @Get(':filename')
    @UseGuards(JwtAuthForComputersGuard)
    @Header('Content-Type', 'application/octet-stream')
    async getFile(@Param('filename') filename: string, @Res() res: Response, @Req() req: Request) {
        const filePath = join(process.cwd(), 'uploads', 'agents', filename + '.exe');
        console.log(filePath);
        

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);
    }
}
