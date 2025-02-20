import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const exeptionResponse = exception.getResponse();

        const error =
            typeof exeptionResponse === 'string'
                ? { message: exeptionResponse }
                : (exeptionResponse as object);

        response.status(status).json({
            success: false,
            statusCode: status,
            ...error,
            timestamp: new Date().toISOString(),
        });
    }
}
