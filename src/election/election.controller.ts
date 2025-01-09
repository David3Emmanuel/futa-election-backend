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
import {
  CreateElectionDTO,
  ElectionSummary,
  UpdateElectionDTO,
  CreateElectionResponse,
  DeleteCandidatesOrVotersDTO,
  addPeopleCount,
  FetchElectionResponse,
} from './election.dto'
import { CandidateWithId } from 'src/schemas/candidate.schema'
import { VoterWithId } from 'src/schemas/voter.schema'

@Controller('election')
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @Get('active')
  @ApiOkResponse({
    description: 'Get the active election',
    type: FetchElectionResponse,
  })
  @ApiNotFoundResponse({
    description: 'There is no active election',
  })
  async getActiveElection() {
    return addPeopleCount(await this.electionService.getActiveElection())
  }

  @Get('active/summary')
  @ApiOkResponse({
    description: 'Get the active election summary',
    type: ElectionSummary,
  })
  @ApiNotFoundResponse({
    description: 'There is no active election',
  })
  @ApiOperation({
    summary: 'Get the active election summary',
    description: 'Not fully implemented yet.',
  })
  async getActiveElectionSummary() {
    return this.electionService.getActiveElectionSummary()
  }

  @Get('latest')
  @ApiOkResponse({
    description: 'Get the latest election',
    type: FetchElectionResponse,
  })
  @ApiNotFoundResponse({
    description: 'No elections found',
  })
  async getLatestElection() {
    return addPeopleCount(await this.electionService.getLatestElection())
  }

  @Get('latest/summary')
  @ApiOkResponse({
    description: 'Get the latest election summary',
    type: ElectionSummary,
  })
  @ApiNotFoundResponse({
    description: 'No elections found',
  })
  @ApiOperation({
    summary: 'Get the latest election summary',
    description: 'Not fully implemented yet.',
  })
  async getLatestElectionSummary() {
    return this.electionService.getLatestElectionSummary()
  }

  @Get(':year/summary')
  @ApiOkResponse({
    description: 'Get election summary by year',
    type: ElectionSummary,
  })
  @ApiNotFoundResponse({
    description: 'Election not found for the given year',
  })
  @ApiOperation({
    summary: 'Get election summary by year',
    description: 'Not fully implemented yet.',
  })
  async getElectionSummaryByYear(@Param('year') year: number) {
    return this.electionService.getElectionSummaryByYear(year)
  }

  @Get(':year/candidates')
  @ApiOkResponse({
    description: 'Get all candidates for a particular year',
    type: [CandidateWithId],
  })
  @ApiNotFoundResponse({
    description: 'Election not found for the given year',
  })
  @ApiOperation({
    summary: 'Get all candidates for a particular year',
  })
  async getCandidatesByYear(
    @Param('year') year: number,
  ): Promise<CandidateWithId[]> {
    return this.electionService.getCandidatesByYear(year)
  }

  @Get(':year/voters')
  @ApiOkResponse({
    description: 'Get all voters for a particular year',
    type: [VoterWithId],
  })
  @ApiNotFoundResponse({
    description: 'Election not found for the given year',
  })
  @ApiOperation({
    summary: 'Get all voters for a particular year',
  })
  async getVotersByYear(@Param('year') year: number): Promise<VoterWithId[]> {
    return this.electionService.getVotersByYear(year)
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Post()
  @ApiCreatedResponse({
    description: 'Create a new election for the current year',
    type: CreateElectionResponse,
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

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Patch('remove-people')
  @ApiOperation({
    summary: 'Delete candidates or voters from the latest election',
    description:
      'Delete candidates or voters from the latest election if it is not active',
  })
  @ApiOkResponse({
    description: 'Candidates or voters deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'No elections found',
  })
  @ApiConflictResponse({
    description: 'Election already started',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  deleteCandidatesOrVoters(
    @Body() deleteCandidatesOrVotersDTO: DeleteCandidatesOrVotersDTO,
  ) {
    return this.electionService.deleteCandidatesOrVoters(
      deleteCandidatesOrVotersDTO,
    )
  }

  @Get(':year')
  @ApiOkResponse({
    description: 'Get election by year',
    type: FetchElectionResponse,
  })
  @ApiNotFoundResponse({
    description: 'Election not found for the given year',
  })
  async getElectionByYear(@Param('year') year: number) {
    return addPeopleCount(await this.electionService.getElectionByYear(year))
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Patch(':year')
  @ApiOperation({
    summary: 'Update election by year',
    description: 'WARNING: This will delete all existing votes',
  })
  @ApiOkResponse({
    description: 'Update election by year',
    type: CreateElectionResponse,
  })
  @ApiNotFoundResponse({
    description: 'Election not found for the given year',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  updateElectionByYear(
    @Param('year') year: number,
    @Body() updateElectionDTO: UpdateElectionDTO,
  ) {
    return this.electionService.updateElectionByYear(year, updateElectionDTO)
  }
}
