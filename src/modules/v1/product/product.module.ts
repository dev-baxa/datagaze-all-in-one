import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
// import { ServerModule } from '../server/server.module';
import { CryptoService } from './services/crypto.service';

@Module({
    controllers: [ProductController],
    providers: [ProductService , CryptoService],
    imports: [AuthModule],
    exports: [ProductService],
})
export class ProductModule {}
