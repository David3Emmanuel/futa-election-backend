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

  validate(payload: Voter & { iat: number; exp: number }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...rest } = payload
    const voter = rest as Voter
    if (!voter) throw new UnauthorizedException('Invalid token')
    if (!voter.email)
      throw new UnauthorizedException('Invalid token. Email is required')
    if (!voter.name)
      throw new UnauthorizedException('Invalid token. Name is required')

    return voter
  }
}
