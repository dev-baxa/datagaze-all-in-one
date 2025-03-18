import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ComputerService } from "./comp.service";

@Controller('computer')
@UseGuards(JwtAuthGuard , RolesGuard)
export class ComputerController {
  constructor(private readonly compService: ComputerService){}

  @Get('all')
  async getAllComputers() {
    const computers = await this.compService.getAllComputers();
    
  }
}