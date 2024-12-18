import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Voter, VoterWithId } from 'src/schemas/voter.schema'
import { VoterService } from 'src/voter/voter.service'

@Injectable()
export class JWTVoteStrategy extends PassportStrategy(Strategy, 'jwt-vote') {
  constructor(private readonly voterService: VoterService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  async validate(
    payload: Voter & { iat: number; exp: number },
  ): Promise<VoterWithId> {
    const { email, name } = payload

    if (!(email && name)) {
      console.warn('Detected vote attempt without email/name')
      throw new UnauthorizedException('Invalid voter token')
    }

    const voter = await this.voterService.getVoterByName(email)
    if (voter?.email !== email) {
      console.warn('Detected vote attempt with wrong email')
      throw new UnauthorizedException('Invalid voter token')
    }

    return voter
  }
}
