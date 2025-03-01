import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/v1/auth/auth.module';
import { ProductModule } from './modules/v1/product/product.module';
import { ServerModule } from './modules/v1/server/server.module';
import { SshModule } from './modules/v1/ssh-connection/ssh.connection.module';
import { UserModule } from './modules/v1/user/user.module';

@Module({
    imports: [AuthModule, UserModule, ServerModule, SshModule, ProductModule],
    // controllers: [AppController],
    // providers: [AppService],
})
export class AppModule {}
