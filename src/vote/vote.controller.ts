import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JWTVoteGuard } from './jwt-vote.guard'
import { Voter } from 'src/schemas/voter.schema'
import { VoteDTO } from './vote.dto'

@Controller('vote')
export class VoteController {
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
}
