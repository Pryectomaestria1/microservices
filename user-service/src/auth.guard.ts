import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class AuthGuard implements CanActivate {
  private client = jwksClient({
    jwksUri: 'https://dev-m5kswumrcd6lw7tg.us.auth0.com/.well-known/jwks.json',
  });

  private getKey(header: any, callback: any) {
    this.client.getSigningKey(header.kid, (err, key: any) => {
      const signingKey = key?.publicKey || key?.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('No token provided');

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKey.bind(this), {}, (err, decoded) => {
        if (err) return reject(new UnauthorizedException('Invalid token signature'));
        request.user = decoded;
        resolve(true);
      });
    });
  }
}
