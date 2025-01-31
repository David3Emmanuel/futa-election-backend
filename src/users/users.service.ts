import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { SignUpDTO } from 'src/auth/auth.dto'
import {
  asPublicUser,
  extractUser,
  PublicUser,
  User,
} from 'src/schemas/user.schema'
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

  async anyUserExists() {
    return (await this.model.countDocuments().exec()) > 0
  }

  async createUser(userDetails: SignUpDTO) {
    if (await this.anyUserExists())
      throw new ForbiddenException('Admin already exists')

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(userDetails.password, salt)
    await new this.model({
      ...userDetails,
      password: undefined,
      passwordHash,
    }).save()
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  async findUserById(userId: string | Types.ObjectId): Promise<User | null> {
    return this.model.findById(userId).exec()
  }

  async updatePassword(user: PublicUser, password: string) {
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)
    await this.model.findByIdAndUpdate(user._id, { passwordHash }).exec()
  }
}
