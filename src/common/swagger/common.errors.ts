import { ApiResponse } from '@nestjs/swagger';

// Common error responses
export const ApiUnauthorizedResponse = (): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Unauthorized' },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });

export const ApiNotFoundResponse = (entity: string): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 404,
        description: `${entity} Not Found`,
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                message: {
                    type: 'string',
                    example: `${entity} not found`,
                },
                error: { type: 'string', example: 'Not Found' },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });

export const ApiBadRequestResponse = (
    message: string = 'Bad Request',
): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 400,
        description: message,
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                message: { type: 'string', example: `${message}` },
                error: { type: 'string', example: 'Bad Request' },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });

export const ApiInternalServerErrorResponse = (
    message: string = 'Internal Server Error',
): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 500,
        description: 'Internal Server Error',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                message: { type: 'string', example: message },
                error: { type: 'string', example: 'Internal Server Error' },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });

export const ApiSuccessResponse = (
    key: string,
    value: string | object,
): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 200,
        description: 'Success',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: true },
                [key]: { type: 'string', example: value },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });
export const ApiCreatedResponse = (message: string = 'Created'): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 201,
        description: 'Created',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: true },
                message: { type: 'string', example: message },
                data: { type: 'object' },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });

export const ApiForbiddenResponse = (
    message: string = 'You do not have permittion',
): MethodDecorator & ClassDecorator =>
    ApiResponse({
        status: 403,
        description: 'Forbidden',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                message: { type: 'string', example: message },
                error: { type: 'string', example: 'Forbidden' },
                timestamp: {
                    type: 'string',
                    example: new Date(Date.now() + 5 * 60 * 60 * 1000)
                        .toISOString()
                        .replace('Z', `+05:00`),
                },
            },
        },
    });

// export const ApiAuth = () => applyDecorators(ApiBearerAuth('JWT'), ApiUnauthorizedResponse());
