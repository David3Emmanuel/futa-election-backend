import { ForbiddenException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { extractSession, Session } from 'src/schemas/session.schema'

@Injectable()
export class SessionService {
  started = false
  maxSessions = 2

  constructor(
    @InjectModel(Session.name) private model: Model<Session>,
    private jwtService: JwtService,
  ) {
    console.log('Resetting sessions...')
    this.model
      .deleteMany()
      .exec()
      .then(() => {
        this.started = true
        console.log('Session service started')
      })
  }

  private async waitForStart() {
    while (!this.started) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  private async canCreateWithinLimits(userId: string) {
    const count = await this.model.countDocuments({ userId }).exec()
    if (count >= this.maxSessions) await this.removeStaleSessions(userId)
    else return true

    const recount = await this.model.countDocuments({ userId }).exec()
    return recount < this.maxSessions
  }

  private async removeStaleSessions(userId: string) {
    const sessions = (await this.model.find({ userId }).exec()).map(
      extractSession,
    )
    const toDelete = sessions
      .filter((session) => {
        try {
          this.jwtService.verify(session.accessToken)
          return false
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          return true
        }
      })
      .map((session) => session._id)

    if (toDelete.length > 0)
      await this.model.deleteMany({ _id: { $in: toDelete } }).exec()
  }

  async createSession(userId: string, accessToken: string) {
    await this.waitForStart()
    if (!(await this.canCreateWithinLimits(userId)))
      throw new ForbiddenException()

    const created = await new this.model({ userId, accessToken }).save()
    return extractSession(created)
  }

  async findSession(userId: string, accessToken: string) {
    await this.waitForStart()
    const session = await this.model.findOne({ userId, accessToken }).exec()
    return session && extractSession(session)
  }

  async deleteSessionsByUserId(userId: string) {
    await this.waitForStart()
    await this.model.deleteMany({ userId }).exec()
  }
}
