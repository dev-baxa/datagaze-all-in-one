import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "src/modules/v1/auth/auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(private authService: AuthService){

    }
    canActivate(context: ExecutionContext): boolean  {
        const request = context.switchToHttp().getRequest(); 
        
        const token = this.extractTokenFromHeader(request)
        
        
        if(!token){
            throw new UnauthorizedException('Token not found');
        }

        try {
            (async ()=>{
                const  payload = await this.authService.decryptJWT(token);
                request.user = payload;
            })();
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
        return true;

    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'] ?? ''

        const [type, token] = authHeader.split(' ')
        
        return type === 'Bearer' ? token : undefined
    }
}