import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { SshConnectService } from "./ssh.connection.service";
import { ConnectionDTO } from "./dto/ssh.connection.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";



@Controller('ssh')
@UseGuards(JwtAuthGuard)
export class SshController{
    constructor(private readonly sshService: SshConnectService ){
    }
    @Post('connect')
    @UsePipes(new ValidationPipe({ whitelist : true}))
    async connect(@Body() connectionData: ConnectionDTO , @Req() req  ){
        const user = req.user;
        
        const result = this.sshService.connectToServer2(connectionData , user);
        console.log(result);
        
    }
}
