import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
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

  @ApiOperation({ summary: 'Verify Token' })
  @ApiBearerAuth()
  @UseGuards(JWTVoteGuard)
  @Get('verify')
  async verify(@Request() req: Request & { user: VoterWithId }) {
    return { message: 'Token is valid', voter: req.user }
  }

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
    const results: {
      message: string
      voterId: string
      candidateId: string
    }[] = []
    for (const candidateId of voteDto.candidateIds) {
      const res = await this.electionService.castVote(
        req.user._id.toString(),
        candidateId,
        true,
      )
      results.push(res)
    }

    return results
  }

  @ApiOperation({ summary: 'Check if already voted' })
  @ApiBearerAuth()
  @UseGuards(JWTVoteGuard)
  @Get('already-voted')
  async alreadyVoted(@Request() req: Request & { user: VoterWithId }) {
    const voted = await this.electionService.checkIfAlreadyVoted(
      req.user._id.toString(),
    )
    return { voted }
  }

  @Post('token')
  async getToken(@Body() voter: Voter) {
    return { token: await this.voteService.generateToken(voter) }
  }
}
