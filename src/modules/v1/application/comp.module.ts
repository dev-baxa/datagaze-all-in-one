import { Module } from "@nestjs/common";
import { ComputerService } from "./comp.service";
import { ComputerController } from "./comp.controller";
import { AuthModule } from "../auth/auth.module";
import { AgentModule } from "../agent/agent.module";


@Module({
  imports:[AuthModule , AgentModule],
  providers: [ComputerService],
  exports: [ComputerService],
  controllers:[ComputerController]
})

export class ComputerModule {}