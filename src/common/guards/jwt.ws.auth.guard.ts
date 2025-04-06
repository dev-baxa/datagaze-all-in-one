import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/modules/v1/auth/auth.service';
import { IPayload } from 'src/modules/v1/auth/entities/token.interface';

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
            const payload: IPayload = await this.authService.decryptJWT(token);
            context.switchToWs().getData().user = payload;
            return true;
        } catch {
            throw new WsException('Invalid token');
        }
    }

    private extractTokenFromClient(client: Socket): string | null {
        const token = client.handshake?.headers.authorization?.split(' ')[1];
        return token ? token : null;
    }
}
