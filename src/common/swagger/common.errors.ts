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
                message: { type: 'string', example: 'Unauthorized' },
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
                    example: `${entity} not found`,
                },
                error: { type: 'string', example: 'Not Found' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

export const ApiBadRequestResponse = (message: string = 'Bad Request', exampleId?: string) =>
    ApiResponse({
        status: 400,
        description: message,
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: `${message}` },
                error: { type: 'string', example: 'Bad Request' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

export const ApiInternalServerErrorResponse = (message: string = 'Internal Server Error') =>
    ApiResponse({
        status: 500,
        description: 'Internal Server Error',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: message },
                error: { type: 'string', example: 'Internal Server Error' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

export const ApiSuccessResponse = (key , value) =>
    ApiResponse({
        status: 200,
        description: 'Success',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: true },
                [key]: { type: 'string', example: value },
            },
        },
    });
export const ApiCreatedResponse = (message: string = 'Created') =>
    ApiResponse({
        status: 201,
        description: 'Created',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 201 },
                message: { type: 'string', example: message },
                data: { type: 'object' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

    export const ApiForbiddenResponse = (message: string = 'You do not have permittion') =>
    ApiResponse({
        status: 403,
        description: 'Forbidden',
        schema: {
            type: 'object',
            properties: {
                succes: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: 403 },
                message: { type: 'string', example: message },
                error: { type: 'string', example: 'Forbidden' },
                timestamp: { type: 'string', example: new Date().toISOString() },
            },
        },
    });

// export const ApiAuth = () => applyDecorators(ApiBearerAuth('JWT'), ApiUnauthorizedResponse());
