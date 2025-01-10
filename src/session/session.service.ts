import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { extractSession, Session } from 'src/schemas/session.schema'

@Injectable()
export class SessionService {
  started = false
  constructor(@InjectModel(Session.name) private model: Model<Session>) {
    // Delete all sessions
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

  async createSession(userId: string, accessToken: string) {
    await this.waitForStart()
    const created = await new this.model({ userId, accessToken }).save()
    console.log(await this.model.find().exec())
    return extractSession(created)
  }

  async findSession(userId: string, accessToken: string) {
    await this.waitForStart()
    const session = await this.model.findOne({ userId, accessToken }).exec()
    console.log(await this.model.find().exec())
    return session && extractSession(session)
  }

  async deleteSessionsByUserId(userId: string) {
    await this.waitForStart()
    await this.model.deleteMany({ userId }).exec()
    console.log(await this.model.find().exec())
  }
}
