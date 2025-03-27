import { Module } from "@nestjs/common";
import { ComputerService } from "./comp.service";
import { ComputerController } from "./comp.controller";
import { AuthModule } from "../auth/auth.module";


@Module({
  imports:[AuthModule],
  providers: [ComputerService],
  exports: [ComputerService],
  controllers:[ComputerController]
})

export class ComputerModule {}