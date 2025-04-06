import { log } from 'console';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExcetionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        log(exception);

        response.status(status).json({
            success: false,
            path: request.url,
            timestamp: new Date(Date.now() + 5 * 60 * 60 * 1000)
                .toISOString()
                .replace('Z', `+05:00`),
            message: exception instanceof Error ? exception.message : 'Unknown error',
        });
    }
}
