import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExcetionsFilter } from './common/filters/all-exception.filter';
import { ENV } from './config/env';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
    // console.log(ENV);

    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExcetionsFilter());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.enableCors()
    // app.useWebSocketAdapter(new IoAdapter(app))
    
    await app.listen(ENV.PORT ?? 3000 , ENV.HOST ?? '127.0.0.1');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
