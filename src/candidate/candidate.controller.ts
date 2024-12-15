import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common'
import { CandidateService } from './candidate.service'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { Candidate, CandidateWithId } from 'src/schemas/candidate.schema'
import { UpdateCandidateDTO } from './candidate.dto'
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard'
import { BulkAddRequestDTO } from './candidate.dto'

@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('all')
  @ApiOkResponse({
    description: 'Get all candidates from all elections',
    type: [CandidateWithId],
  })
  getAllCandidates() {
    return this.candidateService.getAllCandidates()
  }

  @Get()
  @ApiOkResponse({
    description: 'Get candidate by name',
    type: CandidateWithId,
  })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  getCandidateByName(@Query('name') name: string) {
    return this.candidateService.getCandidateByName(name)
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get candidate by id',
    type: CandidateWithId,
  })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  getCandidateById(@Param('id') id: string) {
    return this.candidateService.getCandidateById(id)
  }

  @Post()
  @ApiConflictResponse({
    description: 'Candidate already exists',
  })
  @ApiCreatedResponse({
    description: 'Created candidated successfully',
  })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  createCandidate(@Body() candidate: Candidate) {
    return this.candidateService.createCandidate(candidate)
  }

  @Patch(':id')
  @ApiConflictResponse({
    description: 'Candidate update conflict',
  })
  @ApiOkResponse({
    description: 'Updated candidate successfully',
  })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  updateCandidate(
    @Param('id') id: string,
    @Body() candidate: UpdateCandidateDTO,
  ) {
    return this.candidateService.updateCandidate(id, candidate)
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Deleted candidate successfully',
  })
  @ApiNotFoundResponse({ description: 'Candidate not found' })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  removeCandidate(@Param('id') id: string) {
    return this.candidateService.removeCandidate(id)
  }

  @Post('bulk')
  @ApiOkResponse({
    description: 'Bulk added candidates successfully',
  })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  bulkAddCandidates(@Body() candidatesDto: BulkAddRequestDTO) {
    return this.candidateService.bulkAddCandidates(candidatesDto.candidates)
  }
}
