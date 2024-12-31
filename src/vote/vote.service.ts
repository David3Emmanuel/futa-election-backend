import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Voter } from 'src/schemas/voter.schema'

@Injectable()
export class VoteService {
  constructor(private jwtService: JwtService) {}
  async generateToken(voter: Voter) {
    return this.jwtService.sign({
      email: voter.email,
    })
  }
}
