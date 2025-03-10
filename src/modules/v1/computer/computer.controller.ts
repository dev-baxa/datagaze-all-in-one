import { Body, Controller, Get, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthForComputersGuard } from 'src/common/guards/jwt.auth.for.computers.guard';
import { ComputerService } from './computer.service';
import { CreateComputerDTO } from './dto/create.computer.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';

@Controller('computers')
export class ComputerController {
    constructor(private readonly computerService: ComputerService) {}

    @Post('create')
    async createComputer(@Body(new ValidationPipe()) body: CreateComputerDTO) {
        const token = await this.computerService.createComputerAndReturnToken(body);

        return token
    }

    @Put('applications')
    @UseGuards(JwtAuthForComputersGuard)
    async updateApplications(
        @Body(new ValidationPipe())
        body: UpdateApplicationsDTO[],
        @Req() req,
    ) {
      await this.computerService.updateApplications(body, req.computer);
      
      return {
        status: 'success',
        message: 'Applications updated successfully',
      };
    }
  @Get('applications')
  async getApplications() {
    const result = await this.computerService.getApplications()
    return result

  }
}
