import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ConnectToServerDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  productId: string

  @IsNotEmpty()
  @IsString()
  password:string
  
}