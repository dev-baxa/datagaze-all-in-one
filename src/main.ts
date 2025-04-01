import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExcetionsFilter } from './common/filters/all-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ENV } from './config/env';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('DATAGAZE ALL IN ONE PLATFORM')
        .setDescription(
            'Datagaze All-in-One is a system for medium and large organizations that allows them to install, monitor, and update applications from the Datagaze ecosystem or partner organizations.',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('API')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalFilters(new AllExcetionsFilter(), new HttpExceptionFilter());
    app.enableCors();

    await app.listen(ENV.PORT ?? 4000, ENV.HOST ?? '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
