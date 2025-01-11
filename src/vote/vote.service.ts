import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ElectionService } from 'src/election/election.service'
import { Voter } from 'src/schemas/voter.schema'

@Injectable()
export class VoteService {
  constructor(
    private jwtService: JwtService,
    private readonly electionService: ElectionService,
  ) {}
  async generateToken(voter: Voter) {
    const electionId = (
      await this.electionService.getLatestElection()
    )._id.toString()
    return this.jwtService.sign({
      email: voter.email,
      electionId,
    })
  }
}
