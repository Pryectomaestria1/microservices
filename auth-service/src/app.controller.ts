import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'register' })
  register(data: any) {
    // Lógica real iría a Prisma
    console.log('Auth-Service: Registrando usuario', data.email);
    return { message: 'Usuario registrado con éxito (desde Auth-Service)', userId: 'micro-uuid-123' };
  }

  @MessagePattern({ cmd: 'login' })
  login(data: any) {
    // Lógica real validaría JWT
    console.log('Auth-Service: Login para', data.email);
    return { 
      access_token: 'fake-jwt-token-microservice',
      user: { name: 'Micro Gabo', email: data.email }
    };
  }
}
