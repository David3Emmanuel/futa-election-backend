import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JWTVoteGuard } from './jwt-vote.guard'
import { Voter, VoterWithId } from 'src/schemas/voter.schema'
import { VoteDTO, VotesDTO } from './vote.dto'
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

  @ApiOperation({ summary: 'Cast votes' })
  @ApiBearerAuth()
  @UseGuards(JWTVoteGuard)
  @Post('/batch')
  async votes(
    @Body() voteDto: VotesDTO,
    @Request() req: Request & { user: VoterWithId },
  ) {
    console.log(req.user, voteDto)
    return await Promise.all(
      voteDto.candidateIds.map((candidateId) =>
        this.electionService.castVote(req.user._id.toString(), candidateId),
      ),
    )
  }

  @Post('token')
  async getToken(@Body() voter: Voter) {
    return { token: await this.voteService.generateToken(voter) }
  }
}
