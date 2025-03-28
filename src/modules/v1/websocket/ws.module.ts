import { Module } from "@nestjs/common";
import { TerminalGateway } from "./gateways/terminal.gateway";
import { TerminalService } from "./services/terminal.service";


@Module({
  providers: [TerminalGateway , TerminalService],
  exports: [TerminalService]
})

export class WebSocketModule{}