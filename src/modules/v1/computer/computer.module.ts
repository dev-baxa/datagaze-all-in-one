import { Module } from "@nestjs/common";
import { ComputerService } from "./computer.service";
import { ComputerController } from "./computer.controller";
import { ComputerAuthService } from "./service/computer.auth.service";
import { ComputerWebSocketGatewat } from "./service/computer.socket.service";



@Module({
  providers: [ComputerService , ComputerAuthService , ComputerWebSocketGatewat] ,
  exports: [ComputerService],
  controllers: [ComputerController]
})

export class ComputerModule {}