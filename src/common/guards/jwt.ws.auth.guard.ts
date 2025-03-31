import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/modules/v1/auth/auth.service';
import { Payload } from 'src/modules/v1/auth/entities/token.interface';

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromClient(client);

        if (!token) {
            throw new WsException('Token not found');
        }

        try {
            const payload: Payload = await this.authService.decryptJWT(token);
            context.switchToWs().getData().user = payload;
            return true;
        } catch (error) {
            throw new WsException('Invalid token');
        }
    }

    private extractTokenFromClient(client: any): string | null {
        const token = client.handshake?.headers.authorization?.split(' ')[1];
        return token ? token : null;
    }
}
