import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Election, extractElection } from 'src/schemas/election.schema'
import { ElectionWithoutVotes } from './hideVotes'
import { hideVotes } from './hideVotes'

@Injectable()
export class ElectionService {
  constructor(@InjectModel(Election.name) private model: Model<Election>) {}

  async getLatestElection(): Promise<ElectionWithoutVotes> {
    const latest = await this.model.findOne().sort({ year: -1 }).exec()
    if (!latest) throw new NotFoundException('No elections found')
    return hideVotes(extractElection(latest))
  }

  async getActiveElection(): Promise<ElectionWithoutVotes> {
    const latest = await this.getLatestElection()
    if (latest.active) return latest
    throw new NotFoundException('There is no active election')
  }

  async getElectionByYear(year: number): Promise<ElectionWithoutVotes> {
    const election = await this.model.findOne({ year }).exec()
    if (!election)
      throw new NotFoundException('Election not found for the given year')
    return hideVotes(extractElection(election))
  }

  async createElection(): Promise<void> {
    try {
      await this.getActiveElection()
      throw new ConflictException('There is already an active election')
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e
    }

    const currentYear = new Date().getFullYear()
    try {
      await this.getElectionByYear(currentYear)
      throw new ConflictException(
        'Election already exists for the current year',
      )
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e
    }

    const election = new this.model({ year: currentYear, active: true })
    await election.save()
  }

  async endActiveElection(): Promise<void> {
    const active = await this.getActiveElection()
    if (!active) throw new NotFoundException('There is no active election')
    await this.model.updateOne({ _id: active._id }, { active: false })
  }
}
