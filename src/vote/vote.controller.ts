import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JWTVoteGuard } from './jwt-vote.guard'
import { Voter } from 'src/schemas/voter.schema'
import { VoteDTO } from './vote.dto'
import { VoteService } from './vote.service'

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @ApiOperation({ summary: 'Cast a vote' })
  @ApiBearerAuth()
  @UseGuards(JWTVoteGuard)
  @Post()
  async vote(
    @Body() voteDto: VoteDTO,
    @Request() req: Request & { user: Voter },
  ) {
    return { voter: req.user, voteDto }
  }

  @Post('token')
  async getToken(@Body() voter: Voter) {
    return { token: await this.voteService.generateToken(voter) }
  }
}
