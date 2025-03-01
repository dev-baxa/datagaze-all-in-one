import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
import { ServerModule } from '../server/server.module';

@Module({
    controllers: [ProductController],
    providers: [ProductService],
    imports: [AuthModule, ServerModule],
    exports: [ProductService],
})
export class ProductModule {}
