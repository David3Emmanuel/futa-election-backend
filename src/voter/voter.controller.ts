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
import { VoterService } from './voter.service'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { Voter, VoterWithId } from 'src/schemas/voter.schema'
import { UpdateVoterDTO } from './voter.dto'
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard'
import { BulkAddRequestDTO } from './voter.dto'

@Controller('voter')
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Get('all')
  @ApiOkResponse({
    description: 'Get all voters from all elections',
    type: [VoterWithId],
  })
  getAllVoters() {
    return this.voterService.getAllVoters()
  }

  @Get()
  @ApiOkResponse({
    description: 'Get voter by name',
    type: VoterWithId,
  })
  @ApiNotFoundResponse({ description: 'Voter not found' })
  getVoterByEmail(@Query('email') email: string) {
    return this.voterService.getVoterByEmail(email)
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Get voter by id',
    type: VoterWithId,
  })
  @ApiNotFoundResponse({ description: 'Voter not found' })
  getVoterById(@Param('id') id: string) {
    return this.voterService.getVoterById(id)
  }

  @Post()
  @ApiConflictResponse({
    description: 'Voter already exists',
  })
  @ApiCreatedResponse({
    description: 'Created voterd successfully',
  })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  createVoter(@Body() voter: Voter) {
    return this.voterService.createVoter(voter)
  }

  @Patch(':id')
  @ApiConflictResponse({
    description: 'Voter update conflict',
  })
  @ApiOkResponse({
    description: 'Updated voter successfully',
  })
  @ApiNotFoundResponse({ description: 'Voter not found' })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  updateVoter(@Param('id') id: string, @Body() voter: UpdateVoterDTO) {
    return this.voterService.updateVoter(id, voter)
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Deleted voter successfully',
  })
  @ApiNotFoundResponse({ description: 'Voter not found' })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  removeVoter(@Param('id') id: string) {
    return this.voterService.removeVoter(id)
  }

  @Post('bulk')
  @ApiOkResponse({
    description: 'Bulk added voters successfully',
  })
  @ApiOperation({
    deprecated: true,
    description:
      'To add multiple voters, consider using the POST /election to create a new election with voters',
  })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  bulkAddVoters(@Body() votersDto: BulkAddRequestDTO) {
    return this.voterService.bulkAddVoters(votersDto.voters)
  }
}
