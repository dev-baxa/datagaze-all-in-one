import { Module } from '@nestjs/common';
import { AuthModule } from './modules/v1/auth/auth.module';
import { ProductModule } from './modules/v1/product/product.module';
import { ServerModule } from './modules/v1/server/server.module';
import { SshModule } from './modules/v1/ssh-connection/ssh.connection.module';
import { UploadModule } from './modules/v1/upload/upload.module';
import { UserModule } from './modules/v1/user/user.module';
import { ComputerModule } from './modules/v1/computer/computer.module';

@Module({
    imports: [AuthModule, UserModule, ServerModule, SshModule, UploadModule, ProductModule , ComputerModule],
    // controllers: [AppController],
    // providers: [AppService],
})
export class AppModule {}
