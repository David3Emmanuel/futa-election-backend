import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JWTVoteGuard } from './jwt-vote.guard'
import { VoterWithId } from 'src/schemas/voter.schema'
import { VoteDTO } from './vote.dto'
import { VoteService } from './vote.service'
import { ElectionService } from 'src/election/election.service'

@Controller('vote')
export class VoteController {
  constructor(
    private readonly voteService: VoteService,
    private readonly electionService: ElectionService,
  ) {}

  @ApiOperation({ summary: 'Cast a vote' })
  @ApiBearerAuth()
  @UseGuards(JWTVoteGuard)
  @Post()
  async vote(
    @Body() voteDto: VoteDTO,
    @Request() req: Request & { user: VoterWithId },
  ) {
    return this.electionService.castVote(
      req.user._id.toString(),
      voteDto.candidateId,
    )
  }

  // @Post('token')
  // async getToken(@Body() voter: Voter) {
  //   return { token: await this.voteService.generateToken(voter) }
  // }
}
