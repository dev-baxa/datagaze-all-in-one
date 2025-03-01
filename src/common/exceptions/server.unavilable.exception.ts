import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerUnavilableException extends HttpException {
    constructor(error: string) {
        super(
            {
                status: 'error',
                message: 'Server is not rechable. Please check the network connection .',
                error: error,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
}
