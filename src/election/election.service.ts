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
  PositionSummary,
  UpdateElectionDTO,
  DeleteCandidatesOrVotersDTO,
} from './election.dto'
import { CandidateService } from 'src/candidate/candidate.service'
import { VoterService } from 'src/voter/voter.service'
import { CandidateWithId } from 'src/schemas/candidate.schema'
import { CronService } from 'src/cron/cron.service'

@Injectable()
export class ElectionService {
  constructor(
    @InjectModel(Election.name) private model: Model<Election>,
    private readonly candidateService: CandidateService,
    private readonly voterService: VoterService,
    private readonly cronService: CronService,
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
  }: CreateElectionDTO): Promise<CreateElectionResponse> {
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

      // Set past positions for each candidate
      for (const candidateId of new_candidates) {
        const candidate =
          await this.candidateService.getCandidateById(candidateId)
        await this.candidateService.setPastPosition(
          candidateId,
          currentYear,
          candidate.currentPosition,
        )
      }
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

    const extracted = extractElection(election)
    response.jobStatus = await this.createElectionJobs(extracted)

    response.message = 'Success'
    return response
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

      // Set past positions for each candidate
      for (const candidateId of new_candidates) {
        const candidate =
          await this.candidateService.getCandidateById(candidateId)
        await this.candidateService.setPastPosition(
          candidateId,
          year,
          candidate.currentPosition,
        )
      }
    }

    let new_voters: string[] | undefined
    if (voters) {
      response.voters = await this.voterService.bulkAddVoters(voters)
      new_voters = response.voters.ids
    }

    const updatedElection = await this.model.findByIdAndUpdate(election._id, {
      startDate: start,
      endDate: end,
      candidateIds: new_candidates,
      voterIds: new_voters,
    })

    if (updatedElection) {
      const extracted = extractElection(updatedElection)
      response.jobStatus = await this.createElectionJobs(extracted)
    }

    response.message = 'Success'
    return response
  }

  async endActiveElection(): Promise<void> {
    const active = await this.getActiveElection()
    if (!active) throw new NotFoundException('There is no active election')
    await this.model.updateOne({ _id: active._id }, { endDate: new Date() })
  }

  async deleteCandidatesOrVoters({
    candidateIds,
    voterIds,
  }: DeleteCandidatesOrVotersDTO) {
    const election = await this.getLatestElection()
    if (!election) throw new NotFoundException('No elections found')
    if (new Date() > election.startDate)
      throw new ConflictException(
        'Cannot delete candidates or voters from an already started election',
      )

    if (candidateIds) {
      election.candidateIds = election.candidateIds.filter(
        (id) => !candidateIds.includes(id),
      )
    }

    if (voterIds) {
      election.voterIds = election.voterIds.filter(
        (id) => !voterIds.includes(id),
      )
    }

    await this.model.findByIdAndUpdate(election._id, {
      candidateIds: election.candidateIds,
      voterIds: election.voterIds,
    })

    return { message: 'Candidates or voters deleted successfully' }
  }

  private async generateElectionSummary(
    election: ElectionWithId,
  ): Promise<ElectionSummary> {
    // generate summary for each position
    const { positions, candidates } =
      await this.retrieveCandidatesAndPositions(election)

    return {
      active: isActive(election),
      endDate: election.endDate,
      startDate: election.startDate,
      totalVotes: election.votes?.length || 0,
      year: getYear(election),
      positions: Object.fromEntries(
        [...positions].map((position) => {
          return [
            position,
            this.generatePositionSummary(election, position, candidates),
          ]
        }),
      ),
    }
  }

  private async retrieveCandidatesAndPositions(election: ElectionWithId) {
    const candidates = await Promise.all(
      election.candidateIds.map((id) =>
        this.candidateService.getCandidateById(id),
      ),
    )
    const positions = new Set(
      candidates.map((candidate) => candidate.currentPosition),
    )
    return { positions, candidates }
  }

  private generatePositionSummary(
    election: ElectionWithId,
    position: string,
    allCandidates: CandidateWithId[],
  ): PositionSummary {
    const positionCandidates = allCandidates.filter(
      (candidate) => candidate.currentPosition === position,
    )

    const relevantVotes = election.votes?.filter((vote) =>
      positionCandidates.some(
        (candidate) => candidate._id.toString() === vote.candidateId,
      ),
    )

    const totalVotes = relevantVotes?.length || 0
    const numberOfVotes = new Map<string, number>()

    positionCandidates.forEach((candidate) => {
      numberOfVotes.set(candidate._id.toString(), 0)
    })

    relevantVotes?.forEach((vote) => {
      const candidateId = vote.candidateId
      numberOfVotes.set(candidateId, numberOfVotes.get(candidateId)! + 1)
    })

    const sortedCandidates = positionCandidates.sort((a, b) => {
      return (
        (numberOfVotes.get(b._id.toString()) || 0) -
        (numberOfVotes.get(a._id.toString()) || 0)
      )
    })

    const leadingCandidates = sortedCandidates.map((candidate) => ({
      candidate,
      count: numberOfVotes.get(candidate._id.toString())!,
    }))

    return {
      totalVotes,
      leadingCandidates,
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
    const candidate = await this.candidateService.getCandidateById(candidateId)

    if (election.votes) {
      if (
        election.votes.find(
          async (vote) =>
            vote.voterId === voterId &&
            (await this.candidateService.getCandidateById(vote.candidateId))
              .currentPosition === candidate.currentPosition,
        )
      )
        throw new ConflictException('Voter has already voted for this position')
    } else {
      election.votes = []
    }

    election.votes.push({ voterId, candidateId })
    await this.model.updateOne({ _id: election._id }, { votes: election.votes })

    return { message: 'Vote cast successfully', voterId, candidateId }
  }

  async createStartJob(election: ElectionWithId) {
    // Overwrite the start job if it exists
    if (election.startJobId) {
      await this.cronService.deleteJob(election.startJobId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const job = await this.cronService.createJob({
        enabled: true,
        title: `Start ${getYear(election)} Election`,
        schedule: this.cronService.dateToSchedule(election.startDate),
        saveResponses: true,
        url: '/send-emails/pre-post',
      })
      await this.model.findByIdAndUpdate(election._id, {
        startJobId: job.jobId,
      })
    }
  }

  async createEndJob(election: ElectionWithId) {
    // Overwrite the end job if it exists
    if (election.endJobId) {
      await this.cronService.deleteJob(election.endJobId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const job = await this.cronService.createJob({
        enabled: true,
        title: `End ${getYear(election)} Election`,
        schedule: this.cronService.dateToSchedule(election.endDate),
        saveResponses: true,
        url: '/send-emails/pre-post',
      })
      await this.model.findByIdAndUpdate(election._id, { endJobId: job.jobId })
    }
  }

  async createElectionJobs(
    election: ElectionWithId,
  ): Promise<CreateElectionResponse['jobStatus']> {
    const results = await Promise.all([
      new Promise((resolve: (value: 'Success' | 'Failed') => void) => {
        this.createStartJob(election)
          .then(() => resolve('Success'))
          .catch(() => resolve('Failed'))
      }),
      new Promise((resolve: (value: 'Success' | 'Failed') => void) => {
        this.createEndJob(election)
          .then(() => resolve('Success'))
          .catch(() => resolve('Failed'))
      }),
    ])

    return {
      start: results[0],
      end: results[1],
    }
  }
}
