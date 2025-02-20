import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExcetionsFilter } from './common/filters/all-exception.filter';
import { ENV } from './config/env';

async function bootstrap() {
    // console.log(ENV);
    
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExcetionsFilter());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
