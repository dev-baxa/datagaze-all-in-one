import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExcetionsFilter } from './common/filters/all-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });
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

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new AllExcetionsFilter());
    app.enableCors({
        origin: '*',
        methods: 'GET,PUT,POST,DELETE',
    });

    await app.listen(env.PORT ?? 4000, env.HOST ?? '0.0.0.0');
}
void bootstrap();
