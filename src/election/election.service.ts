import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  Election,
  ElectionWithId,
  extractElection,
  getYear,
  isActive,
} from 'src/schemas/election.schema'
import { ElectionWithoutVotes } from './hideVotes'
import { hideVotes } from './hideVotes'
import {
  CreateElectionDTO,
  CreateElectionResponse,
  ElectionSummary,
  UpdateElectionDTO,
} from './election.dto'
import { CandidateService } from 'src/candidate/candidate.service'
import { VoterService } from 'src/voter/voter.service'
import { EmailService } from 'src/email/email.service'

@Injectable()
export class ElectionService {
  constructor(
    @InjectModel(Election.name) private model: Model<Election>,
    private readonly candidateService: CandidateService,
    private readonly voterService: VoterService,
    private readonly emailService: EmailService,
  ) {}

  private async getLatestElectionWithVotes() {
    const election = await this.model.findOne().sort({ startDate: -1 }).exec()
    return election ? extractElection(election) : null
  }

  private async getElectionByYearWithVotes(year: number) {
    const election = await this.model
      .findOne({
        startDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      })
      .exec()
    return election ? extractElection(election) : null
  }

  async getLatestElection(): Promise<ElectionWithoutVotes> {
    const latest = await this.getLatestElectionWithVotes()
    if (!latest) throw new NotFoundException('No elections found')
    return hideVotes(latest)
  }

  async getLatestElectionSummary() {
    const latest = await this.getLatestElectionWithVotes()
    if (!latest) throw new NotFoundException('No elections found')
    return this.generateElectionSummary(latest)
  }

  async getActiveElection(): Promise<ElectionWithoutVotes> {
    const latest = await this.getLatestElection()
    if (isActive(latest)) return latest
    throw new NotFoundException('There is no active election')
  }

  async getActiveElectionSummary() {
    const latest = await this.getLatestElectionWithVotes()
    if (!latest) throw new NotFoundException('No elections found')
    if (!isActive(latest))
      throw new NotFoundException('There is no active election')
    return this.generateElectionSummary(latest)
  }

  async getElectionByYear(year: number): Promise<ElectionWithoutVotes> {
    const election = await this.getElectionByYearWithVotes(year)
    if (!election)
      throw new NotFoundException('Election not found for the given year')
    return hideVotes(election)
  }

  async getElectionSummaryByYear(year: number) {
    const election = await this.getElectionByYearWithVotes(year)
    if (!election)
      throw new NotFoundException('Election not found for the given year')
    return this.generateElectionSummary(election)
  }

  async createElection({
    start,
    end,
    candidates,
    voters,
  }: CreateElectionDTO): Promise<{
    message: string
    bulk: CreateElectionResponse
  }> {
    const currentYear = new Date().getFullYear()
    if (start) {
      // Ensure the start date is between now and end of the year
      if (start.getFullYear() !== currentYear || start < new Date())
        throw new BadRequestException('Invalid start date')
    } else {
      // Default to tomorrow
      start = new Date(new Date().setHours(0, 0, 0, 0))
      start.setDate(start.getDate() + 1)
    }

    if (end) {
      // Ensure the end date is between start and end of the year
      if (end < start) throw new BadRequestException('Invalid end date')
    } else {
      // Default to 14 days from start
      end = new Date(start)
      end.setDate(end.getDate() + 14)
    }

    try {
      await this.getActiveElection()
      throw new ConflictException('There is already an active election')
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e
    }

    try {
      await this.getElectionByYear(currentYear)
      throw new ConflictException(
        'Election already exists for the current year',
      )
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e
    }

    const response = new CreateElectionResponse()

    let new_candidates: string[] | undefined
    if (candidates) {
      response.candidates =
        await this.candidateService.bulkAddCandidates(candidates)
      new_candidates = response.candidates.ids
    }

    let new_voters: string[] | undefined
    if (voters) {
      response.voters = await this.voterService.bulkAddVoters(voters)
      new_voters = response.voters.ids
    }

    const election = new this.model({
      startDate: start,
      endDate: end,
      candidateIds: new_candidates,
      voterIds: new_voters,
    })
    await election.save()

    return { message: 'Success', bulk: response }
  }

  async updateElectionByYear(
    year: number,
    updateElectionDTO: UpdateElectionDTO,
  ) {
    const election = await this.getElectionByYear(year)
    let { start, end } = updateElectionDTO
    const { candidates, voters } = updateElectionDTO

    if (start) {
      // Ensure the start date is between now and end of the year
      if (start.getFullYear() !== year || start < new Date())
        throw new BadRequestException('Invalid start date')
    } else {
      start = election.startDate
    }

    if (end) {
      // Ensure the end date is between start and end of the year
      if (end < start) throw new BadRequestException('Invalid end date')
    } else if (election.endDate < start) {
      throw new BadRequestException(
        'End date required for the given start date',
      )
    } else {
      end = election.endDate
    }

    const response = new CreateElectionResponse()

    let new_candidates: string[] | undefined
    if (candidates) {
      response.candidates =
        await this.candidateService.bulkAddCandidates(candidates)
      new_candidates = response.candidates.ids
    }

    let new_voters: string[] | undefined
    if (voters) {
      response.voters = await this.voterService.bulkAddVoters(voters)
      new_voters = response.voters.ids
    }

    await new this.model({
      startDate: start,
      endDate: end,
      candidateIds: new_candidates,
      voterIds: new_voters,
    }).save()

    return response
  }

  async endActiveElection(): Promise<void> {
    const active = await this.getActiveElection()
    if (!active) throw new NotFoundException('There is no active election')
    await this.model.updateOne({ _id: active._id }, { active: false })
  }

  private generateElectionSummary(election: ElectionWithId): ElectionSummary {
    // TODO generate summary for each position
    const summary = {}
    return {
      active: isActive(election),
      endDate: election.endDate,
      startDate: election.startDate,
      totalVotes: election.votes?.length || 0,
      year: getYear(election),
      summary,
    }
  }

  async castVote(voterId: string, candidateId: string) {
    const election = await this.getLatestElectionWithVotes()
    if (!election) throw new NotFoundException('No elections found')
    if (!isActive(election))
      throw new NotFoundException('There is no active election')

    // Confirm that voter belongs this election
    if (!election.voterIds.includes(voterId))
      throw new UnauthorizedException('Cannot participate in this election')

    // Confirm that candidate belongs this election
    if (!election.candidateIds.includes(candidateId))
      throw new NotFoundException('Candidate not found in this election')

    // Confirm that voter has not voted before
    // FIXME this should be checked for only candidates's position
    if (election.votes) {
      if (election.votes.find((vote) => vote.voterId === voterId))
        throw new ConflictException('Voter has already voted')
    } else {
      election.votes = []
    }

    election.votes.push({ voterId, candidateId })
    await this.model.updateOne({ _id: election._id }, { votes: election.votes })

    return { message: 'Vote cast successfully', voterId, candidateId }
  }
}
