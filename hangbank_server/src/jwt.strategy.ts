import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,    // rejects expired tokens
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Whatever you return becomes req.user
    console.log("JWT payload:", payload);
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
