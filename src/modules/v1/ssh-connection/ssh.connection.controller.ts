import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import {
    ApiBadRequestResponse,
    ApiSuccessResponse,
    ApiUnauthorizedResponse,
} from 'src/common/swagger/common.errors';
import { User } from '../auth/entities/user.interface';
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
    async connect(@Body() connectionData: ConnectionDTO, @Req() req) {
        const user: User = req.user;

        const result = await this.sshService.connectToServerCheck(connectionData, user);
        return result;
    }
}
