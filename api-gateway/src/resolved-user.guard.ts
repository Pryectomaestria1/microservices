import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import * as ms from '@nestjs/microservices';
import { firstValueFrom, type Observable } from 'rxjs';

interface ValidateTokenResponse {
  isValid: boolean;
  userId: string;
  role: string;
}

interface UserServiceGrpc {
  ValidateToken(payload: { token: string }): Observable<ValidateTokenResponse>;
}

@Injectable()
export class ResolvedUserGuard implements CanActivate, OnModuleInit {
  private authService!: UserServiceGrpc;

  constructor(@Inject('USER_SERVICE') private clientUser: ms.ClientGrpc) {}

  onModuleInit() {
    this.authService = this.clientUser.getService('UserService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('Token de acceso faltante');
    }

    const validation = await firstValueFrom(this.authService.ValidateToken({ token }));

    if (!validation?.isValid || !validation.userId) {
      throw new ForbiddenException('Token inválido');
    }

    request.user = {
      ...(request.user || {}),
      userId: validation.userId,
      role: validation.role,
    };

    return true;
  }
}
