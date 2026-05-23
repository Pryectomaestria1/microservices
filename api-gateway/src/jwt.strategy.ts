import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { extractRole } from './roles';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const issuerUrl = configService.get<string>('AUTH0_ISSUER_URL');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    if (!issuerUrl || !audience) {
      throw new Error('AUTH0_ISSUER_URL and AUTH0_AUDIENCE environment variables must be defined');
    }

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerUrl.endsWith('/') ? issuerUrl : issuerUrl + '/'}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: audience,
      issuer: issuerUrl.endsWith('/') ? issuerUrl : issuerUrl + '/',
      algorithms: ['RS256'],
    });
  }

  async validate(payload: Record<string, unknown>) {
    return {
      userId: typeof payload.sub === 'string' ? payload.sub : '',
      role: extractRole(payload),
    };
  }
}
