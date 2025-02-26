import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/modules/v1/auth/auth.service';
import { Payload } from 'src/modules/v1/auth/entities/token.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        

            const payload: Payload = await this.authService.decryptJWT(token);
            const user = await this.authService.findById(payload.id)
            if (!user)
                throw new UnauthorizedException('User unauthorized')
            request.user = payload;
        return true;
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'] ?? '';

        const [type, token] = authHeader.split(' ');

        return type === 'Bearer' ? token : undefined;
    }
}
