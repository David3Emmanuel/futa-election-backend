import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SignUpDTO } from 'src/auth/auth.dto'
import { asPublicUser, extractUser, User } from 'src/schemas/user.schema'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  async getUsers() {
    return (await this.model.find().exec()).map((userDocument) =>
      asPublicUser(extractUser(userDocument)),
    )
  }

  async getRawUserByEmail(email: string) {
    const userDocument = await this.model.findOne({ email }).exec()
    return userDocument && extractUser(userDocument)
  }

  async getUserByEmail(email: string) {
    const user = await this.getRawUserByEmail(email)
    return user && asPublicUser(user)
  }

  async createUser(userDetails: SignUpDTO) {
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(userDetails.password, salt)
    this.model.create({
      ...userDetails,
      password: undefined,
      passwordHash,
    })
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  private async findUserById(userId: string): Promise<User | null> {
    return this.model.findById(userId).exec()
  }
}
