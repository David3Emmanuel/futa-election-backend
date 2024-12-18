import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ElectionService } from 'src/election/election.service'
import { Voter } from 'src/schemas/voter.schema'

@Injectable()
export class VoteService {
  constructor(
    private jwtService: JwtService,
    private electionService: ElectionService,
  ) {}
  async generateToken(voter: Voter) {
    return this.jwtService.sign({
      email: voter.email,
      name: voter.name,
    })
  }
}
