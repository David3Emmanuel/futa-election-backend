import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Election, extractElection } from 'src/schemas/election.schema'
import { ElectionWithoutVotes } from './hideVotes'
import { hideVotes } from './hideVotes'
import { CreateElectionDTO, UpdateElectionDTO } from './election.dto'
import { CandidateService } from 'src/candidate/candidate.service'
import { VoterService } from 'src/voter/voter.service'
import { Candidate } from 'src/schemas/candidate.schema'
import { Voter } from 'src/schemas/voter.schema'

@Injectable()
export class ElectionService {
  constructor(
    @InjectModel(Election.name) private model: Model<Election>,
    private readonly candidateService: CandidateService,
    private readonly voterService: VoterService,
  ) {}

  private async getLatestElectionWithVotes() {
    const election = await this.model.findOne().sort({ year: -1 }).exec()
    return election ? extractElection(election) : null
  }

  private async getElectionByYearWithVotes(year: number) {
    const election = await this.model.findOne({ year }).exec()
    return election ? extractElection(election) : null
  }

  async getLatestElection(): Promise<ElectionWithoutVotes> {
    const latest = await this.getLatestElectionWithVotes()
    if (!latest) throw new NotFoundException('No elections found')
    return hideVotes(latest)
  }

  async getActiveElection(): Promise<ElectionWithoutVotes> {
    const latest = await this.getLatestElection()
    if (latest.active) return latest
    throw new NotFoundException('There is no active election')
  }

  async getElectionByYear(year: number): Promise<ElectionWithoutVotes> {
    const election = await this.getElectionByYearWithVotes(year)
    if (!election)
      throw new NotFoundException('Election not found for the given year')
    return hideVotes(election)
  }

  async createElection({
    start,
    end,
    candidates,
    voters,
  }: CreateElectionDTO): Promise<void> {
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

    let new_candidates: Candidate[] | undefined
    if (candidates) {
      const { ids } = await this.candidateService.bulkAddCandidates(candidates)
      new_candidates = []
      ids.forEach(async (id) => {
        const candidate = await this.candidateService.getCandidateById(id)
        new_candidates!.push(candidate)
      })
    }

    let new_voters: Voter[] | undefined
    if (voters) {
      const { ids } = await this.voterService.bulkAddVoters(voters)
      new_voters = []
      ids.forEach(async (id) => {
        const voter = await this.voterService.getVoterById(id)
        new_voters!.push(voter)
      })
    }

    const election = new this.model({
      start,
      end,
      candidates: new_candidates,
      voters: new_voters,
    })
    await election.save()
  }

  async updateElectionByYear(
    year: number,
    updateElectionDTO: UpdateElectionDTO,
  ): Promise<void> {
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

    let new_candidates: Candidate[] | undefined
    if (candidates) {
      const { ids } = await this.candidateService.bulkAddCandidates(candidates)
      new_candidates = []
      ids.forEach(async (id) => {
        const candidate = await this.candidateService.getCandidateById(id)
        new_candidates!.push(candidate)
      })
    }

    let new_voters: Voter[] | undefined
    if (voters) {
      const { ids } = await this.voterService.bulkAddVoters(voters)
      new_voters = []
      ids.forEach(async (id) => {
        const voter = await this.voterService.getVoterById(id)
        new_voters!.push(voter)
      })
    }

    await new this.model({
      start,
      end,
      candidates: new_candidates,
      voters: new_voters,
    }).save()
  }

  async endActiveElection(): Promise<void> {
    const active = await this.getActiveElection()
    if (!active) throw new NotFoundException('There is no active election')
    await this.model.updateOne({ _id: active._id }, { active: false })
  }
}
