import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Voter } from 'src/schemas/voter.schema'

@Injectable()
export class JWTVoteStrategy extends PassportStrategy(Strategy, 'jwt-vote') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  validate(payload: Voter & { iat: number; exp: number }): Voter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (!(payload.email && payload.name))
      throw new UnauthorizedException('Invalid voter token')

    return { email: payload.email, name: payload.name }
  }
}
