import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { ComputerService } from "./computer.service";
import { CreateComputerDTO } from "./dto/create.computer.dto";


@Controller("computers")
export class ComputerController {
  constructor(private readonly computerService: ComputerService) {
    
  }

  @Post('create')
  async createComputer(@Body(new ValidationPipe()) body: CreateComputerDTO) {
    const result = await this.computerService.createComputer(body);
    
    return {
      status: "success",
      token: await this.computerService.gerateToken(result)
    }
  }

}