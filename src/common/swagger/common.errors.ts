import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

// Common error responses
export const ApiUnauthorizedResponse = () =>
    ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 401 },
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: 'Unauthorized access' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

export const ApiNotFoundResponse = (entity: string, exampleId?: string) =>
    ApiResponse({
        status: 404,
        description: `${entity} Not Found`,
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 404 },
                message: {
                    type: 'string',
                    example: `${entity} with ID ${exampleId || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'} not found`,
                },
                error: { type: 'string', example: 'Not Found' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

export const ApiBadRequestResponse = (message: string = 'Bad Request' , exampleId?: string) =>
    ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: `${message || 'Bad Request'}` },
                error: { type: 'string', example: 'Bad Request' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

export const ApiInternalServerErrorResponse = (message: string) =>
    ApiResponse({
        status: 500,
        description: 'Internal Server Error',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: message },
                error: { type: 'string', example: 'Internal Server Error' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

// Common security decorator
export const ApiAuth = () => applyDecorators(ApiBearerAuth('JWT'), ApiUnauthorizedResponse());
