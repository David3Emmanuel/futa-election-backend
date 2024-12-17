import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common'
import { ElectionService } from './election.service'
import { ElectionWithoutVotes } from './hideVotes'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard'
import { CreateElectionDTO } from './election.dto'

@Controller('election')
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @Get('active')
  @ApiOkResponse({
    description: 'Get the active election',
    type: ElectionWithoutVotes,
  })
  @ApiNotFoundResponse({
    description: 'There is no active election',
  })
  getActiveElection() {
    return this.electionService.getActiveElection()
  }

  @Get('latest')
  @ApiOkResponse({
    description: 'Get the latest election',
    type: ElectionWithoutVotes,
  })
  @ApiNotFoundResponse({
    description: 'No elections found',
  })
  getLatestElection() {
    return this.electionService.getLatestElection()
  }

  @Get(':year')
  @ApiOkResponse({
    description: 'Get election by year',
    type: ElectionWithoutVotes,
  })
  @ApiNotFoundResponse({
    description: 'Election not found for the given year',
  })
  getElectionByYear(@Param('year') year: number) {
    return this.electionService.getElectionByYear(year)
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Post()
  @ApiCreatedResponse({
    description: 'Create a new election for the current year',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiConflictResponse({
    description:
      'There is already an active election or an election for the current year',
  })
  @ApiBadRequestResponse({
    description: 'Invalid start or end date',
  })
  @ApiOperation({
    summary: 'Create a new election for the current year',
    description:
      'Create a new election for the current year. All parameters are optional.',
  })
  createElection(@Body() createElectionDTO: CreateElectionDTO) {
    return this.electionService.createElection(createElectionDTO)
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Patch('end')
  @ApiOkResponse({
    description: 'End the active election',
  })
  @ApiNotFoundResponse({
    description: 'No active election to end',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  endActiveElection() {
    return this.electionService.endActiveElection()
  }
}
