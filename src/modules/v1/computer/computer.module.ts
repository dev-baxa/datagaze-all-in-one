import { Module } from "@nestjs/common";
import { ComputerService } from "./computer.service";
import { ComputerController } from "./computer.controller";
import { ComputerAuthService } from "./service/computer.auth.service";



@Module({
  providers: [ComputerService , ComputerAuthService],
  exports: [ComputerService],
  controllers: [ComputerController]
})

export class ComputerModule {}