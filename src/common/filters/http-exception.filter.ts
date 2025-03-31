import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)
    catch(exception: HttpException, host: ArgumentsHost) {
        this.logger.error(`Exception caught: ${exception.message}`);
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
