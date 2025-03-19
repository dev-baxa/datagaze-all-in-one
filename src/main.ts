import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { urlencoded } from 'body-parser';
import { AppModule } from './app.module';
import { AllExcetionsFilter } from './common/filters/all-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WebsocketExceptionFilter } from './common/filters/websocket.exception.filter';
import { ENV } from './config/env';

async function bootstrap() {
    // console.log(ENV);

    const app = await NestFactory.create(AppModule);
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(urlencoded({ limit: '10mb', extended: true }));

    const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('The API description')
        .setVersion('1.0')
        .addTag('API')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalFilters(
        new AllExcetionsFilter(),
        new HttpExceptionFilter(),
    );
    app.enableCors();
    // app.useWebSocketAdapter(new IoAdapter(app))

    await app.listen(ENV.PORT ?? 3000, ENV.HOST ?? '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
