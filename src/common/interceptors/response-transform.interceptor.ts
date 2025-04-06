import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor<T>
    implements NestInterceptor<T, { success: boolean; data: T; timestamp: string }>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<{ success: boolean; data: T; timestamp: string }> {
        return next.handle().pipe(
            map(data => ({
                success: true,
                ...data,
                timestamp: new Date(Date.now() + 5 * 60 * 60 * 1000)
                    .toISOString()
                    .replace('Z', `+05:00`),
            })),
        );
    }
}
