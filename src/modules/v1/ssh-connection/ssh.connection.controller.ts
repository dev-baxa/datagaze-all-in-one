import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-for-access.guard';
import {
    ApiBadRequestResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';

import { IUser } from '../auth/entities/user.interface';
import { ConnectionDTO } from './dto/ssh.connection.dto';
import { SshConnectService } from './ssh.connection.service';

@Controller('ssh')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse()
export class SshController {
    constructor(private readonly sshService: SshConnectService) {}
    @Post('connect')
    @UsePipes(new ValidationPipe({}))
    @ApiSuccessResponse('message', 'Connected successfully.')
    @ApiBadRequestResponse('Invalid authentication method')
    async connect(
        @Body() connectionData: ConnectionDTO,
        @Req() req: Request & { user: IUser },
    ): Promise<object> {
        const user: IUser = req.user;
        return this.sshService.connectToServerCheck(connectionData, user);
    }
}
