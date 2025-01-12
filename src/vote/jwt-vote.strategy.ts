import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ElectionService } from 'src/election/election.service'
import { Voter, VoterWithId } from 'src/schemas/voter.schema'
import { VoterService } from 'src/voter/voter.service'

@Injectable()
export class JWTVoteStrategy extends PassportStrategy(Strategy, 'jwt-vote') {
  constructor(
    private readonly voterService: VoterService,
    private readonly electionService: ElectionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  async validate(
    payload: Voter & { electionId: string; iat: number; exp: number },
  ): Promise<VoterWithId | null> {
    const { email, electionId } = payload

    if (!email) {
      console.warn('Detected vote attempt without email')
      throw new UnauthorizedException('Invalid voter token')
    }

    try {
      const voter = await this.voterService.getVoterByEmail(email)
      if (voter?.email !== email) {
        console.warn('Detected vote attempt with wrong email')
        throw new UnauthorizedException('Invalid voter token')
      }

      const election = await this.electionService.getLatestElection()
      if (election._id.toString() !== electionId) {
        console.warn('Detected vote attempt with past election')
        throw new UnauthorizedException('Invalid voter token')
      }
      return voter
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
