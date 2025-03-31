import { Module } from "@nestjs/common";
import { TerminalGateway } from "./gateways/terminal.gateway";
import { TerminalService } from "./services/terminal.service";
import { SshProductInstallGateway } from "./gateways/connect.gateway";
import { AuthModule } from "../auth/auth.module";
import { SshProductInstallService } from "./services/connect.and.file.upload.service";
import { OperationsGateway } from "./gateways/operatsion.gateway";
import { OperationsService } from "./services/operation.service";


@Module({
  imports:[AuthModule ],
    providers: [TerminalGateway, TerminalService, SshProductInstallGateway , SshProductInstallService , OperationsGateway  , OperationsService],
    exports: [TerminalService , SshProductInstallService],
})
export class WebSocketModule {}     