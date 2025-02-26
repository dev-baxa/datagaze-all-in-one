import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { SshConnectService } from "./ssh.connection.service";
import { ConnectionDTO } from "./dto/ssh.connection.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { User } from "../auth/entities/user.interface";
import { executeDto } from "./dto/exescute.connection.dto";
import { installDto } from "./dto/product.install.dto";



@Controller('ssh')
@UseGuards(JwtAuthGuard)
export class SshController {
    constructor(private readonly sshService: SshConnectService) {}
    @Post('connect')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async connect(@Body() connectionData: ConnectionDTO, @Req() req) {
        const user: User = req.user;

        const result = await this.sshService.connectToServerCheck(connectionData, user);
        console.log(result);
        return result;
    }

    @Post('execute')
    @HttpCode(HttpStatus.OK)
    async execute(@Body(new ValidationPipe()) body: executeDto) {
        await this.sshService.loadServerConfig(body.productId)
        return await this.sshService.executeInServer(body.command)

    }
    @Post('install')
    @HttpCode(HttpStatus.OK)
    async install(@Body(new ValidationPipe()) body: installDto , @Req() req) {
        const user: User = req.user;
        const result = await this.sshService.installProductInServer(body, user)
        console.log(result);
        return result
        
    }
}
