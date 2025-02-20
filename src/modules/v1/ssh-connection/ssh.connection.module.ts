import { Module } from "@nestjs/common";
import { SshConnectService } from "./ssh.connection.service";
import { SshController } from "./ssh.connection.controller";
import { AuthModule } from "../auth/auth.module";



@Module({
    providers:[SshConnectService],
    controllers:[SshController],
    exports:[SshConnectService],
    imports:[AuthModule]
})

export class SshModule{}