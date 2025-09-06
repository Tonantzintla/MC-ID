import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { CustomJwtPayload } from '../types/payload';

@Injectable()
export class JwtValidationService {
  constructor(private configService: ConfigService) {}

  async validateToken(token: string): Promise<CustomJwtPayload> {
    const jwksUri = new URL(
      this.configService.getOrThrow<string>('website.jwksUri'),
    );

    const JWKS = createRemoteJWKSet(jwksUri);
    try {
      const { payload } = await jwtVerify<CustomJwtPayload>(token, JWKS, {
        issuer: jwksUri.origin,
        audience: jwksUri.origin, // Change later
      });
      return payload;
    } catch {
      throw new Error('Invalid or expired token.');
    }
  }
}
